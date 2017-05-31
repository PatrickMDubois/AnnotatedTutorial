angular.module('AnnotatedTutorial')
    .controller('mainController', function($scope, TutorialService, LoggerService){
        'use strict';

        TutorialService.loaded
        .then(function() {
                $scope.contributor = TutorialService.get();
                $scope.tutorial = $scope.contributor.current_tutorial;
                $scope.selectedLine = null;
                $scope.newNote = "";
                $scope.extraInput = "";
                $scope.inputPos = null;
                $scope.inputCategory = "";
                $scope.replyTo = null;
                $scope.replyToContributor = "";
                $scope.listOfContributors = [];
                $scope.listOfSteps = [];

                $scope.selectedStepsList = [];
                $scope.secondMenu = false;
                $scope.ratingChange = false;
                $scope.deleteChange = false;


                for(var i = 0; i < $scope.tutorial.notes.length; i++) {
                    if($scope.listOfContributors.indexOf($scope.tutorial.notes[i].contributor) == -1) {
                        if(!$scope.tutorial.notes[i].user_submitted || $scope.tutorial.notes[i].contributor === $scope.contributor.name) {
                            $scope.listOfContributors.push(($scope.tutorial.notes[i].contributor));
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

                $scope.windowHeight = window.innerHeight - 88; // from stylesheet

                $scope.lineClicked = function(index, $event){

                    $scope.selectedLine = index;
                    $scope.inputPos = $event.pageY;

                    LoggerService.log("Opened input dialog");
                };

                $scope.addingReply = function($index, $event, id, contributor, step){

                    $scope.replyTo = id;
                    $scope.replyToContributor = contributor;

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

                /*$scope.typeSelected = function(type) {
                    $scope.inputType = type;
                    if(type==='general'){
                        $scope.showTextarea=true;
                        $scope.inputCategory=null;
                    }
                    //LoggerService.log("Changed selection type")
                }*/

                $scope.stepAdded = function(step){
                    /*if(parseInt(chosen)!==-1) {
                        $scope.selectedLine = parseInt(chosen);
                    }else{
                        $scope.selectedLine = $scope.tutorial.steps.length-1;
                    }*/
                    $scope.selectedStepsList.push(step);
                    console.log(step);
                }

                $scope.stepRemoved = function(step,index){
                    $scope.selectedStepsList.splice(index,1);
                }

                $scope.stepSelected=function(step){
                    var index = $scope.selectedStepsList.indexOf(step);
                    if(index== -1){
                        $scope.stepAdded(step)
                    }else{
                        $scope.stepRemoved(step,index);
                    }
                }

                $scope.numberList=function(){
                    $scope.list=[];
                    for(var i =0; i < $scope.selectedStepsList.length; i++){
                        if($scope.selectedStepsList[i].step_number >0 && $scope.selectedStepsList[i].step_number < ($scope.listOfSteps.length-2)) {
                            $scope.list.push($scope.selectedStepsList[i].step_number);
                        }else if($scope.selectedStepsList[i].step_number==$scope.listOfSteps.length-2){
                            $scope.list.push("END");
                        }else if($scope.selectedStepsList[i].step_number==$scope.listOfSteps.length-1){
                            $scope.list.push("WHOLE TUTORIAL");
                        }else{
                            $scope.list.push("INTRO");
                        }
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
                    $scope.replyToContributor = "";
                    $scope.selectedStepsList=[];
                    $scope.stepAdd = false;

                    LoggerService.log("Closed input dialog");
                };

                $scope.submitNote = function(){

                    if(($scope.tutorial.baseline ||$scope.inputType==='general') && $scope.newNote){

                        $scope.selectedLine = null;
                        $scope.inputCategory = "comment";
                        $scope.extraInput = "";
                    }


                    if(($scope.tutorial.baseline|| $scope.selectedStepsList.length!= 0) && $scope.newNote){
                        var note = {
                            "step_id":$scope.selectedStepsList,
                            "tutorial_id": $scope.tutorial.id,
                            "category": $scope.inputCategory,
                            "extra_info": $scope.extraInput,
                            "content": $scope.newNote,
                            "contributor": $scope.contributor.name,
                            "reply_to": $scope.replyTo,
                        };

                        if(!$scope.replyTo && !$scope.tutorial.baseline){
                            note.step_id = $scope.findStepId($scope.selectedStepsList);
                        }else{
                            note.step_id = null;
                        }

                        TutorialService.post(note);
                        $scope.tutorial.notes.push(note);

                        note.step_id = $scope.selectedStepsList;

                        if($scope.replyTo){
                            //note.step_id = $scope.replyStep;
                        }

                        if ($scope.selectedStepsList) {

                            for(var j =0; j<$scope.selectedStepsList.length; j++){
                                $scope.tutorial.steps[parseInt($scope.selectedStepsList[j].step_number)].notes.push(note);
                            }
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

                $scope.findStepId=function(list){
                    var idList = [];
                    for(var i =0; i < $scope.selectedStepsList.length; i++){
                        for(var j =0; j < $scope.listOfSteps.length; j++){
                            if($scope.listOfSteps[j].step_number == $scope.selectedStepsList[i]){
                                idList.push($scope.listOfSteps[j].id);
                                break;
                            }
                        }
                    }
                    return idList;
                }

                $scope.deleteNote = function(note_id){
                    $scope.deleteChange = true;
                    TutorialService.put($scope.findNote(note_id),$scope.deleteChange, $scope.ratingChange);

                    $scope.deleteChange = false;

                    LoggerService.log("Deleted a note:"
                        + " Tutorial - " + $scope.tutorial.titlenp
                        + " | Step - " + $scope.selectedLine
                        + " | Category - " + $scope.inputCategory
                        + " | Extra Input - " + $scope.extraInput
                        + " | Note - " + $scope.newNote);

                }

                $scope.findNote = function(note_id)
                {
                    if(!$scope.tutorial.baseline) {
                        for(var i =0; i < $scope.tutorial.notes.length; i++) {
                            if($scope.tutorial.notes[i].id === note_id) {
                                return $scope.tutorial.notes[i];
                            }
                        }
                    }
                    return null;
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

                  if((!note.user_submitted || note.contributor === $scope.contributor.name) && !note.deleted){

                      canShow = true;
                  }

                  return canShow;
                };

                $scope.newRating = function(note_id){
                    $scope.ratingChange = true;
                    TutorialService.put($scope.findNote(note_id),$scope.deleteChange, $scope.ratingChange);
                    $scope.ratingChange = false;
                }

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

                $scope.showContributors = function(show) {
                    LoggerService.log("Toggled contributor list: "
                        + " Tutorial - " + $scope.tutorial.title
                        + " | Visibility - " + !show);

                    return !show;
                }

                $scope.menuSwitch=function(){
                    $scope.secondMenu = !$scope.secondMenu;
                }

            });
    });