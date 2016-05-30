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
    this.tutorial_id = data.tutorial_id;
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
                    tutorial_id: note.tutorial_id,
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

                $scope.tutorial = TutorialService.get(tutorialId);

                $scope.selectedLine = null;
                $scope.newNote = "";
                $scope.extraInput = "";
                $scope.inputPos = null;
                $scope.inputType = "";
                $scope.replyTo = null;
                $scope.replyToAuthor = "";

                $scope.windowHeight = window.innerHeight - 88; // from stylesheet

                $scope.lineClicked = function($index, $event){

                    $scope.selectedLine = $index + $scope.tutorial.steps[0].id;
                    $scope.inputPos = $event.pageY;

                    //LoggerService.log("Opened input dialog");
                };

                $scope.addingQuestion = function($index, $event){

                    $scope.lineClicked($index, $event);
                    $scope.typeSelected("other");
                    $scope.extraInput = "Question";
                };

                $scope.addingReply = function($index, $event, id, author, step){

                    $scope.replyTo = id;
                    $scope.replyToAuthor = author;

                    if($scope.tutorial.baseline){

                        $scope.typeSelected("other");
                    }
                    else{

                        $scope.selectedLine = step;
                    }

                    $scope.inputPos = $event.pageY;
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

                    if($scope.tutorial.baseline && $scope.newNote){

                        $scope.selectedLine = null;
                        $scope.inputType = "comment";
                        $scope.extraInput = "";
                    }

                    if(($scope.tutorial.baseline || $scope.selectedLine > -1) && $scope.newNote){

                        var note = {
                            "step_id": $scope.selectedLine,
                            "tutorial_id": tutorialId,
                            "category": $scope.inputType,
                            "extra_info": $scope.extraInput,
                            "content": $scope.newNote,
                            "author": localStorage.getItem('participant'),
                            "reply_to": $scope.replyTo
                        };

                        TutorialService.post(note);
                        $scope.tutorial.notes.push(note);

                        if ($scope.selectedLine) {

                            $scope.tutorial.steps[$scope.selectedLine - $scope.tutorial.steps[0].id].notes.push(note);
                        }

                        $scope.closeInput();

                        /*LoggerService.log("Submitted a note:"
                         + " Tutorial - " + TutorialService.tutorial.title
                         + " | Step - " + $scope.selectedLine
                         + " | Category - " + $scope.inputType
                         + " | Extra Input - " + $scope.extraInput
                         + " | Note - " + $scope.newNote);*/
                    }
                };

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
angular.module('AnnotatedTutorial')
    .directive('note', function() {
        'use strict'

        return {
            restrict: 'E',
            templateUrl: 'note.html',
            scope: {tutorial: '='},
            controller: function($scope) {/* ...*/},
            compile: function(element) {{/* ...*/}}
        };
    });