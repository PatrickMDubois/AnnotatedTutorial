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
                $scope.selectedLine = -1;
                $scope.newNote = "";
                $scope.extraInput = "";
                $scope.inputPos = -1;
                $scope.inputType = "";
                $scope.replyTo = -1;
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
                    $scope.selectedLine = -1;
                    $scope.inputPos = -1;
                    $scope.replyTo = -1;
                    $scope.replyToAuthor = "";

                    //LoggerService.log("Closed input dialog");
                };

                $scope.submitNote = function(){

                    if($scope.tutorial.baseline){

                        $scope.submitComment();
                    }

                    else {

                        if ($scope.selectedLine > -1 && $scope.newNote) {

                            $scope.tutorialSteps[$scope.selectedLine].notes.push({
                                "category": $scope.inputType,
                                "extra_info": $scope.extraInput,
                                "content": $scope.newNote,
                                "author": localStorage.getItem('participant'),
                                "reply_to": $scope.replyTo
                            });

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

                        $scope.tutorialComments.push({
                            "content": $scope.newNote,
                            "author": localStorage.getItem('participant'),
                            "reply_to": $scope.replyTo
                        });
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