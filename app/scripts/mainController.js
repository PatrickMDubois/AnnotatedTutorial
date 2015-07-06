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

                $scope.submitNote = function(){

                    if($scope.selectedLine > -1 && $scope.newNote) {
                        $scope.tutorial[$scope.selectedLine].notes.push($scope.newNote);
                        $scope.newNote = "";
                        $scope.selectedLine = -1;
                    }
                };
            });
    });