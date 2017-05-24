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
                $scope.inputCategory = "";
                $scope.replyTo = null;
                $scope.replyToAuthor = "";
                $scope.listOfAuthors = [];
                $scope.listOfSteps = [];
                for(var i = 0; i < $scope.tutorial.notes.length; i++) {
                    if($scope.listOfAuthors.indexOf($scope.tutorial.notes[i].author) == -1) {
                        if(!$scope.tutorial.notes[i].user_submitted || $scope.tutorial.notes[i].author === $scope.author.name) {
                            $scope.listOfAuthors.push(($scope.tutorial.notes[i].author));
                        }
                    }
                }
                for(var i = 0; i < $scope.tutorial.steps.length; i++) {
                    for(var j = 0; j < $scope.tutorial.steps.length; j++) {
                        if ($scope.tutorial.steps[j].step_number == i) {
                            $scope.listOfSteps.push($scope.tutorial.steps[j]);
                            break;
                        }
                    }
                }
                console.log($scope.listOfSteps);

                $scope.windowHeight = window.innerHeight - 88; // from stylesheet

                $scope.lineClicked = function(index, $event){

                    $scope.selectedLine = index;
                    $scope.inputPos = $event.pageY;

                    LoggerService.log("Opened input dialog");
                };

                $scope.addingReply = function($index, $event, id, author, step){

                    $scope.replyTo = id;
                    $scope.replyToAuthor = author;

                    if($scope.tutorial.baseline){

                        $scope.categorySelected("other");
                    }
                    else{

                        $scope.replyStep = step;
                    }

                    $scope.inputPos = $event.pageY;
                };

                $scope.categorySelected = function(category){
                    $scope.showTextarea = true;
                    $scope.inputCategory = category;
                    $scope.extraInput = "";

                    LoggerService.log("Changed input to category: " + category);
                }

                $scope.typeSelected = function(type) {
                    $scope.inputType = type;
                    //LoggerService.log("Changed selection type")
                }

                $scope.stepSelected = function(){
                    if(parseInt(chosen)!==-1) {
                        $scope.selectedLine = parseInt(chosen);
                    }else{
                        $scope.selectedLine = $scope.tutorial.steps.length-1;
                    }
                }

                $scope.closeInput = function(){
                    $scope.showTextarea = false;
                    $scope.inputCategory = "";
                    $scope.newNote = "";
                    $scope.extraInput = "";
                    $scope.selectedLine = null;
                    $scope.inputPos = null;
                    $scope.replyTo = null;
                    $scope.replyToAuthor = "";

                    LoggerService.log("Closed input dialog");
                };

                $scope.submitNote = function(){

                    if($scope.tutorial.baseline && $scope.newNote){

                        $scope.selectedLine = null;
                        $scope.inputCategory = "comment";
                        $scope.extraInput = "";
                    }


                    if(($scope.tutorial.baseline|| $scope.selectedLine> -1) && $scope.newNote){
                        var note = {
                            "step_id":$scope.selectedLine,
                            "tutorial_id": $scope.tutorial.id,
                            "category": $scope.inputCategory,
                            "extra_info": $scope.extraInput,
                            "content": $scope.newNote,
                            "author": $scope.author.name,
                            "reply_to": $scope.replyTo,
                            "type":$scope.inputType
                        };

                        if(!$scope.replyTo){
                            note.step_id = $scope.listOfSteps[$scope.selectedLine].id;//+= $scope.tutorial.steps[0].id;
                            console.log(note.step_id);
                        }else{
                            note.step_id = $scope.replyStep;
                        }

                        TutorialService.post(note);
                        $scope.tutorial.notes.push(note);

                        note.step_id = $scope.selectedLine;

                        if($scope.replyTo){
                            //note.step_id = $scope.replyStep;
                        }

                        if ($scope.selectedLine) {

                            $scope.tutorial.steps[note.step_id].notes.push(note);
                        }

                        $scope.closeInput();

                        LoggerService.log("Submitted a note:"
                         + " Tutorial - " + $scope.tutorial.title
                         + " | Step - " + $scope.selectedLine
                         + " | Category - " + $scope.inputCategory
                         + " | Extra Input - " + $scope.extraInput
                         + " | Note - " + $scope.newNote);
                    }
                };

                $scope.deleteNote = function(note_id){
                    console.log(note_id);
                    if(!$scope.tutorial.baseline) {
                        for(var i =0; i < $scope.tutorial.notes.length; i++) {
                            if($scope.tutorial.notes[i].id == note_id) {
                                $scope.tutorial.notes[i].deleted = true;
                                console.log($scope.tutorial.notes[i].deleted);
                                break;
                            }
                        }
                    }
                    /*LoggerService.log("Deleted a note:"
                        + " Tutorial - " + $scope.tutorial.title
                        + " | Step - " + $scope.selectedLine
                        + " | Category - " + $scope.inputCategory
                        + " | Extra Input - " + $scope.extraInput
                        + " | Note - " + $scope.newNote);*/

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

                  if((!note.user_submitted || note.author === $scope.author.name) && !note.deleted){

                      canShow = true;
                  }

                  return canShow;
                };

                $scope.numberOfNotes = function(step,category)
                {
                    var numNotes = 0;
                    for(var i = 0;i<step.notes.length; i++) {
                       if($scope.canShowNote(step.notes[i]) && step.notes[i].category === category)
                       {
                           numNotes++;
                       }
                    }
                    return numNotes;
                };

                $scope.showCategory = function(show, category, step){

                    LoggerService.log("Toggled category: "
                        + " Tutorial - " + $scope.tutorial.title
                        + " | Category - " + category
                        + " | Visibility - " + !show
                        + " | Step - " + step.html.substr(0, 50) + "...");

                    return !show;
                };

                $scope.showContributors = function(show)
                {
                    /*LoggerService.log("Toggled contributor list: "
                        + " Tutorial - " + $scope.tutorial.title
                        + " | Visibility - " + !show);*/

                    return !show;
                }
            });
    });