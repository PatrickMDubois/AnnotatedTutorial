angular.module('AnnotatedTutorial')
    .controller('mainController', function($scope, TutorialService){
        'use strict';

        TutorialService.loaded
            .then(function() {
                $scope.tutorial = TutorialService.tutorial;

                $scope.availableSoftware = ["GIMP", "PS6"];
                $scope.selectedSoftware = "";
                $scope.selectingLine = false;
                $scope.selectedLine = -1;
                $scope.newNote = "";
                $scope.extraInput = "";
                $scope.hideInput = false;
                $scope.inputPos = -1;
                $scope.inputType = "";

                $scope.toggleSelectMode = function(){
                    $scope.selectingLine = !$scope.selectingLine;
                };

                $scope.lineClicked = function($index, $event){

                    if($scope.selectingLine) {
                        $scope.selectedLine = $index;
                        $scope.selectingLine = false;
                        $scope.inputPos = $event.pageY;
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
                    $scope.extraInput = "";
                    $scope.selectedLine = -1;
                    $scope.inputPos = -1;
                }

                $scope.submitNote = function(){

                    if($scope.selectedLine > -1 && $scope.newNote) {

                        if($scope.inputType == 'details'){
                            $scope.tutorial[$scope.selectedLine].notes.details.push($scope.newNote);
                        }
                        else if($scope.inputType == 'corrections'){
                            $scope.tutorial[$scope.selectedLine].notes.corrections.push($scope.newNote);
                        }
                        else if($scope.inputType == 'methods'){
                            $scope.tutorial[$scope.selectedLine].notes.methods.push({"software": $scope.extraInput, "note": $scope.newNote});
                        }
                        else if($scope.inputType == 'command'){
                            $scope.tutorial[$scope.selectedLine].notes.command.push({"software": $scope.extraInput, "note": $scope.newNote});
                        }

                        $scope.closeInput()
                    }
                };
            });
    });