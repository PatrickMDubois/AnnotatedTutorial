(function(w) {
    'use strict';

        w.app = angular.module('AnnotatedTutorial', ['app-templates']);
})(window);
angular.module('AnnotatedTutorial')
    .factory('TutorialService', function($http){
        'use strict';

        var tutorial = {},
            promise;

        promise = $http.get('/data/stubdata.json')
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
                $scope.tutorial = TutorialService.tutorial;

                $scope.selectingLine = false;
                $scope.selectedLine = -1;
                $scope.newNote = "";
                $scope.hideInput = false;
                $scope.inputPos = -1;
                $scope.inputType = "";

                $scope.toggleSelectMode = function(){
                    $scope.selectingLine = !$scope.selectingLine;

                    if(!$scope.selectingLine){
                        $scope.selectedLine = -1;
                    }
                };

                $scope.lineClicked = function($index, $event){

                    if($scope.selectingLine) {
                        $scope.selectedLine = $index;
                        $scope.selectingLine = false;
                        $scope.inputPos = $event.y;
                    }
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
                    $scope.selectedLine = -1;
                    $scope.inputPos = -1;
                }

                $scope.submitNote = function(){

                    if($scope.selectedLine > -1 && $scope.newNote) {

                        if($scope.inputType == 'details'){$scope.tutorial[$scope.selectedLine].notes.details.push($scope.newNote);}
                        if($scope.inputType == 'corrections'){$scope.tutorial[$scope.selectedLine].notes.corrections.push($scope.newNote);}
                        if($scope.inputType == 'methods'){$scope.tutorial[$scope.selectedLine].notes.methods.push($scope.newNote);}
                        if($scope.inputType == 'command'){$scope.tutorial[$scope.selectedLine].notes.command.push($scope.newNote);}

                        $scope.closeInput()
                    }
                };
            });
    });