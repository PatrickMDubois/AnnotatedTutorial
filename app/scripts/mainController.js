angular.module('AnnotatedTutorial')
    .controller('mainController', function($scope, TutorialService, LoggerService){
        'use strict';

        TutorialService.loaded
        .then(function() {
                $scope.author = TutorialService.get();
                $scope.tutorial = $scope.author.current_tutorial;
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
                            "tutorial_id": $scope.tutorial.id,
                            "category": $scope.inputType,
                            "extra_info": $scope.extraInput,
                            "content": $scope.newNote,
                            "author": $scope.author.name,
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
                      note.author === $scope.author.name){

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