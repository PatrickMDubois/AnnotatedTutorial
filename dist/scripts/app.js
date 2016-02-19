(function(w) {
    'use strict';

    w.app = angular.module('AnnotatedTutorial', ['app-templates', 'ngSanitize']);

    /*app.factory('annotatedTutorialServer', function() {
        if (typeof(DEVELOPMENT) === 'undefined') {
            return '//vdziubak.com:8000'; // production environment
        } else {
            return '//0.0.0.0:7000'; // development environment
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
    });*/

})(window);
/*function Log(data) {
    this.message = data.msg;
    this.participant_id = data.participantId;
    this.created_at = moment().format();
}

angular.module('AnnotatedTutorial')
    .factory('LoggerService', function(currentParticipant, annotatedTutorialServer, $http) {
        'use strict';

        return {
            log: function(msg) {
                var log = new Log({
                  msg: msg,
                  participantId: currentParticipant
                });

                $http.post(annotatedTutorialServer + '/logger/logs', log);
            }
        }
    });*/
angular.module('AnnotatedTutorial')
    .factory('TutorialService', function($http){
        'use strict';

        var tutorial = {},
            promise;

        /*promise = $http.get('/data/stubdata.json')
            .then(function(response) {
                for (var property in response.data) {
                    if (response.data.hasOwnProperty(property)) {
                        tutorial[property] = response.data[property];
                    }
                }
            });*/

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
    .controller('mainController', function($scope, TutorialService){
        'use strict';

        TutorialService.loaded
            .then(function() {
                $scope.tutorial = TutorialService.tutorial.steps;

                $scope.availableSoftware = ["GIMP", "PS6"];
                $scope.selectedSoftware = "All software";
                $scope.selectedLine = -1;
                $scope.newNote = "";
                $scope.extraInput = "";
                $scope.hideInput = false;
                $scope.inputPos = -1;
                $scope.inputType = "";

                $scope.lineClicked = function($index, $event){

                    $scope.selectedLine = $index;
                    $scope.inputPos = $event.pageY;
                };

                $scope.toggleHideInput = function(){
                    $scope.hideInput = !$scope.hideInput;
                };

                $scope.typeSelected = function(type){
                    $scope.showTextarea = true;
                    $scope.inputType = type;
                }

                $scope.closeInput = function(){
                    $scope.showTextarea = false;
                    $scope.inputType = "";
                    $scope.newNote = "";
                    $scope.extraInput = "";
                    $scope.selectedLine = -1;
                    $scope.inputPos = -1;
                }

                $scope.submitNote = function(){

                    if($scope.selectedLine > -1 && $scope.newNote) {

                        if($scope.inputType == 'details'){
                            //$scope.tutorial[$scope.selectedLine].notes.details.push($scope.newNote);
                        }
                        else if($scope.inputType == 'corrections'){
                            //$scope.tutorial[$scope.selectedLine].notes.corrections.push($scope.newNote);
                        }
                        else if($scope.inputType == 'methods'){
                            //$scope.tutorial[$scope.selectedLine].notes.methods.push({"software": $scope.extraInput, "note": $scope.newNote});
                        }
                        else if($scope.inputType == 'command'){
                            //$scope.tutorial[$scope.selectedLine].notes.command.push({"software": $scope.extraInput, "note": $scope.newNote});
                        }

                        $scope.closeInput()
                    }
                };
            });
    });