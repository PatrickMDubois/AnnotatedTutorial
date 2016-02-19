angular.module('AnnotatedTutorial')
    .controller('mainController', function($scope, TutorialService, LoggerService){
        'use strict';

        TutorialService.loaded
            .then(function() {
                $scope.tutorial = TutorialService.tutorial.steps;

                console.log($scope.tutorial[0].notes);

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
            });
    });