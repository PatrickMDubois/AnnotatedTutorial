(function(w) {
    'use strict';

    w.app = angular.module('AnnotatedTutorial', ['app-templates', 'ngSanitize', 'angularMoment']);

    app.factory('annotatedTutorialServer', function() {
        if (typeof(DEVELOPMENT) === 'undefined') {
            return '//dorado.cs.umanitoba.ca:8000'; // production environment
        } else {
            return 'http://127.0.0.1:8000'; // development environment
        }
    });

    app.factory('currentParticipant', function() {
        var participantId = localStorage.getItem('participant');

        if (!participantId) {
            while (!participantId) {
              participantId = prompt('Please, enter your participant number');
            }

            localStorage.setItem('participant', participantId);
          }

        return participantId;
    });

})(window);
function Log(data) {
    this.message = data.msg;
    this.participant_id = data.participantId;
    this.created_at = moment().format();
}

angular.module('AnnotatedTutorial')
    .factory('LoggerService', function(currentParticipant, $http) {
        'use strict';

        return {
            log: function(msg) {
                var log = new Log({
                  msg: msg,
                  participantId: currentParticipant
                });

                //$http.post('http://127.0.0.1:8000/logger/logs', log);
                $http.post(annotatedTutorialServer + '/logger/logs', log);
            }
        }
    });
function Note(data) {
    this.step_id = data.step_id;
    this.category = data.category;
    this.extra_info = data.extra_info;
    this.content = data.content;
    this.author = data.author;
    this.user_submitted = data.user_submitted;
    this.reply_to = data.reply_to;
}

angular.module('AnnotatedTutorial')
    .factory('TutorialService', function($http, annotatedTutorialServer){
        'use strict';

        var tutorials = [],
            idIndexMap = {},
            promise;

        //promise = $http.get('http://127.0.0.1:8000/tutorials/tutorials/1')
        promise = $http.get(annotatedTutorialServer + '/tutorials/tutorials')
            .then(function(response) {
                tutorials = response.data;

                idIndexMap = {};

                angular.forEach(response.data, function(tutorial, index) {
                    idIndexMap[tutorial.id] = index;
                });
            });

        return {
            loaded: promise,
            tutorials: tutorials,
            get: function(id) {
                return tutorials[idIndexMap[id]];
            },
            post: function(note) {
                var note = new Note({
                    step_id: note.step_id,
                    category: note.category,
                    extra_info: note.extra_info,
                    content: note.content,
                    author: note.author,
                    user_submitted: true,
                    reply_to: note.reply_to
                });

                //$http.post('http://127.0.0.1:8000/tutorials/notes', note);
                $http.post(annotatedTutorialServer + '/tutorials/notes', note);
            }
        };
    });
angular.module('AnnotatedTutorial')
    .controller('mainController', function($scope, TutorialService, LoggerService){
        'use strict';

        TutorialService.loaded
        .then(function() {
                var tutorialId = 1//prompt('tutorial number');

                $scope.tutorial = TutorialService.get(tutorialId)
                $scope.tutorialSteps = $scope.tutorial.steps;
                $scope.tutorialComments = [];

                for(var i = 0; i < $scope.tutorialSteps.length; i++){
                    for(var j = 0; j < $scope.tutorialSteps[i].notes.length; j++) {
                        $scope.tutorialComments.push($scope.tutorialSteps[i].notes[j]);
                    }
                }

                $scope.availableSoftware = ["GIMP", "PS6"];
                $scope.selectedSoftware = "All software";
                $scope.selectedLine = null;
                $scope.newNote = "";
                $scope.extraInput = "";
                $scope.inputPos = null;
                $scope.inputType = "";
                $scope.replyTo = null;
                $scope.replyToAuthor = "";

                $scope.windowHeight = window.innerHeight - 88; // from stylesheet

                $scope.lineClicked = function($index, $event){

                    $scope.selectedLine = $index;
                    $scope.inputPos = $event.pageY;

                    //LoggerService.log("Opened input dialog");
                };

                $scope.addingQuestion = function($index, $event){

                    $scope.lineClicked($index, $event);
                    $scope.typeSelected("other");
                    $scope.extraInput = "Question";
                };

                $scope.addingReply = function($index, $event, id, author){

                    $scope.replyTo = id;
                    $scope.replyToAuthor = author;

                    if($scope.tutorial.baseline){

                        $scope.typeSelected("other");
                    }

                    $scope.lineClicked($index, $event);
                }

                $scope.typeSelected = function(type){
                    $scope.showTextarea = true;
                    $scope.inputType = type;
                    $scope.extraInput = "";

                    //LoggerService.log("Changed input to category: " + type);
                };

                $scope.closeInput = function(){
                    $scope.showTextarea = false;
                    $scope.inputType = "";
                    $scope.newNote = "";
                    $scope.extraInput = "";
                    $scope.selectedLine = null;
                    $scope.inputPos = null;
                    $scope.replyTo = null;
                    $scope.replyToAuthor = "";

                    //LoggerService.log("Closed input dialog");
                };

                $scope.submitNote = function(){

                    if($scope.tutorial.baseline){

                        $scope.submitComment();
                    }

                    else {

                        if ($scope.selectedLine > -1 && $scope.newNote) {

                            var note = {
                                "step_id": $scope.selectedLine,
                                "category": $scope.inputType,
                                "extra_info": $scope.extraInput,
                                "content": $scope.newNote,
                                "author": localStorage.getItem('participant'),
                                "reply_to": $scope.replyTo
                            };

                            //$scope.tutorialSteps[$scope.selectedLine].notes.push(note);
                            TutorialService.post(note);

                            /*LoggerService.log("Submitted a note:"
                             + " Tutorial - " + TutorialService.tutorial.title
                             + " | Step - " + $scope.selectedLine
                             + " | Category - " + $scope.inputType
                             + " | Extra Input - " + $scope.extraInput
                             + " | Note - " + $scope.newNote);*/
                            $scope.closeInput()
                        }
                    }
                };

                $scope.submitComment = function() {

                    if ($scope.newNote) {

                        var note = {
                            "step_id": null,
                            "category": "comment",
                            "extra_info": "",
                            "content": $scope.newNote,
                            "author": localStorage.getItem('participant'),
                            "reply_to": $scope.replyTo
                        };

                        //$scope.tutorialComments.push(note);
                        TutorialService.post(note);
                        $scope.closeInput();
                    }
                }

                $scope.checkForCategory = function(step, category){

                    var hasCategory = false;

                    for(var i = 0; !hasCategory && i < step.notes.length; i++){
                        if($scope.canShowNote(step.notes[i]) && step.notes[i].category === category) {
                            hasCategory = true;
                        }
                    }

                    return hasCategory;
                };

                $scope.canShowNote = function(note){

                  var canShow = false;

                  if($scope.tutorial.show_to_all ||
                      !note.user_submitted ||
                      note.author === localStorage.getItem('participant')){

                      canShow = true;
                  }

                  return canShow;
                };

                $scope.showCategory = function(show, category, step){

                    /*LoggerService.log("Toggled category: "
                        + " Tutorial - " + TutorialService.tutorial.title
                        + " | Category - " + category
                        + " | Visibility - " + !show
                        + " | Step - " + step.html.substr(0, 50) + "...");*/

                    return !show;
                };
            });
    });