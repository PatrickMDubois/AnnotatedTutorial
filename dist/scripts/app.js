(function(w) {
    'use strict';

    w.app = angular.module('AnnotatedTutorial', ['app-templates', 'ngSanitize', 'angularMoment']);

    /*app.factory('annotatedTutorialServer', function() {
        if (typeof(DEVELOPMENT) === 'undefined') {
            return '//vdziubak.com:8000'; // production environment
        } else {
            return '//0.0.0.0:7000'; // development environment
        }
    });*/

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

                $http.post('http://127.0.0.1:8000/logger/logs', log);
            }
        }
    });
angular.module('AnnotatedTutorial')
    .factory('TutorialService', function($http){
        'use strict';

        var tutorial = {}, promise;

        promise = $http.get('http://127.0.0.1:8000/tutorials/tutorial/1')
            .then(function(response) {
                for (var property in response.data) {
                    if (response.data.hasOwnProperty(property)) {
                        tutorial[property] = response.data[property];
                    }
                }
            });

        return {
            loaded: promise,
            tutorial: tutorial
        };
    });
angular.module('AnnotatedTutorial')
    .controller('mainController', function($scope, TutorialService, LoggerService){
        'use strict';

        TutorialService.loaded
            .then(function() {
                $scope.tutorial = TutorialService.tutorial.steps;

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

                    LoggerService.log("Opened input dialog");
                };

                $scope.typeSelected = function(type){
                    $scope.showTextarea = true;
                    $scope.inputType = type;

                    LoggerService.log("Changed input to category: " + type);
                }

                $scope.closeInput = function(){
                    $scope.showTextarea = false;
                    $scope.inputType = "";
                    $scope.newNote = "";
                    $scope.extraInput = "";
                    $scope.selectedLine = -1;
                    $scope.inputPos = -1;

                    LoggerService.log("Closed input dialog");
                }

                $scope.submitNote = function(){

                    if($scope.selectedLine > -1 && $scope.newNote) {

                        $scope.tutorial[$scope.selectedLine].notes.push({"category": $scope.inputType, "software": $scope.extraInput, "content": $scope.newNote});

                        LoggerService.log("Submitted a note:"
                            + " Tutorial - " + TutorialService.tutorial.title
                            + " | Step - " + $scope.selectedLine
                            + " | Category - " + $scope.inputType
                            + " | Software - " + $scope.extraInput
                            + " | Note - " + $scope.newNote);
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
                }

                $scope.showCategory = function(show, category, step){

                    LoggerService.log("Toggled category: "
                        + " Tutorial - " + TutorialService.tutorial.title
                        + " | Category - " + category
                        + " | Visibility - " + !show
                        + " | Step - " + step.html.substr(0, 50) + "...");

                    return !show;
                }
            });
    });