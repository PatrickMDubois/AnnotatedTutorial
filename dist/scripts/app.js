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
            }
        };
    });
angular.module('AnnotatedTutorial')
    .controller('mainController', function($scope, TutorialService, LoggerService){
        'use strict';

        TutorialService.loaded
        .then(function() {
                var tutorialId = 1//prompt('tutorial number');

                $scope.tutorial = TutorialService.get(tutorialId).steps;

                $scope.availableSoftware = ["GIMP", "PS6"];
                $scope.selectedSoftware = "All software";
                $scope.selectedLine = -1;
                $scope.newNote = "";
                $scope.extraInput = "";
                $scope.inputPos = -1;
                $scope.inputType = "";

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
                    $scope.selectedLine = -1;
                    $scope.inputPos = -1;

                    //LoggerService.log("Closed input dialog");
                };

                $scope.submitNote = function(){

                    if($scope.selectedLine > -1 && $scope.newNote) {

                        $scope.tutorial[$scope.selectedLine].notes.push({"category": $scope.inputType, "software": $scope.extraInput, "content": $scope.newNote, "author": localStorage.getItem('participant')});

                        /*LoggerService.log("Submitted a note:"
                            + " Tutorial - " + TutorialService.tutorial.title
                            + " | Step - " + $scope.selectedLine
                            + " | Category - " + $scope.inputType
                            + " | Extra Input - " + $scope.extraInput
                            + " | Note - " + $scope.newNote);*/
                        $scope.closeInput()
                    }
                };

                $scope.checkForCategory = function(step, category){

                    var hasCategory = false;

                    for(var i = 0; !hasCategory && i < step.notes.length; i++){
                        if(step.notes[i].category === category) {
                            hasCategory = true;
                        }
                    }

                    return hasCategory;
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