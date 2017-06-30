angular.module('AnnotatedTutorial')
    .controller('mainController', function($scope, TutorialService, LoggerService){
        'use strict';

        TutorialService.loaded
        .then(function() {
                $scope.contributor = TutorialService.get();
                $scope.tutorial = $scope.contributor.current_tutorial;
                $scope.newNote = "";
                $scope.extraInput = "";
                $scope.inputCategory = "";
                $scope.replyTo = null;
                $scope.replyToContributor = "";
                $scope.listOfContributors = [];
                $scope.listOfSteps = [];

                $scope.ratingChange = false;
                $scope.deleteChange = false;

                //the list of notes that are going to be shown
                $scope.listOfNotes = ($scope.tutorial.notes.slice(0)).reverse();

                //list of contributors
                for(var i = 0; i < $scope.tutorial.notes.length; i++) {
                    if($scope.listOfContributors.indexOf($scope.tutorial.notes[i].contributor) == -1) {
                        if(!$scope.tutorial.notes[i].user_submitted || $scope.tutorial.notes[i].contributor === $scope.contributor.name) {
                            $scope.listOfContributors.push(($scope.tutorial.notes[i].contributor));
                        }
                    }
                }
                //creates the list of steps and organizes them based on step number
                for(var g = 0; g < $scope.tutorial.steps.length; g++) {
                    for(var j = 0; j < $scope.tutorial.steps.length; j++) {
                        if ($scope.tutorial.steps[j].step_number == g) {
                            $scope.listOfSteps.push($scope.tutorial.steps[j]);
                            break;
                        }
                    }
                }

                $scope.windowHeight = window.innerHeight - 88; // from stylesheet

                $scope.addingReply = function($index, $event, id, contributor, step){

                    if($scope.replyTo != id){
                        $scope.replyTo =id;
                        $scope.replyToContributor = contributor;
                        $scope.replyStep = step;
                    }else{
                        $scope.replyTo=null;
                        $scope.replyToContributor=null;
                        $scope.replyStep=null;
                    }
                };

                $scope.newSort = function(){
                  if(chosenSort==="new" || chosenSort === undefined || chosenSort === null|| chosenSort==="old"){
                      $scope.orderDate($scope.listOfNotes);
                      if(chosenSort==="old") {
                        $scope.listOfNotes.reverse();
                      }
                  }else if(chosenSort=="high" || chosenSort=="low"){
                      $scope.orderRating($scope.listOfNotes);
                        if(chosenSort=="low") {
                            $scope.listOfNotes.reverse();
                        }
                  }
                };

                $scope.findStepNumber = function(stepID){
                  for(var j =0; j < $scope.listOfSteps.length; j++){
                      if($scope.listOfSteps[j].id === stepID){
                          return $scope.listOfSteps[j].step_number;
                      }
                  }
                    return null;
                };

                $scope.closeInput = function(){
                    $scope.inputCategory = "";
                    $scope.newNote = "";
                    $scope.extraInput = "";
                    $scope.replyTo = null;
                    $scope.replyToContributor = "";

                    LoggerService.log("Closed input dialog");
                };

                $scope.submitNote = function(){
                    $scope.inputCategory = "comment";
                    $scope.extraInput = "";

                    if(($scope.replyTo!==null) || $scope.newNote){
                        var note = {
                            "step_id":[],
                            "tutorial_id": $scope.tutorial.id,
                            "category": $scope.inputCategory,
                            "extra_info": $scope.extraInput,
                            "content": $scope.newNote,
                            "contributor": $scope.contributor.name,
                            "reply_to": $scope.replyTo
                        };

                        if(!$scope.replyTo ){
                            note.step_id = null;
                        }
                        TutorialService.post(note);

                        note.rating = 0;
                        $scope.tutorial.notes.push(note);

                        note.step_id = $scope.selectedStepsList;

                        if($scope.replyTo){
                            $scope.tutorial.notes[$scope.findNoteIndex(note.reply_to)].replies.push(note);
                        }

                        $scope.listOfNotes = ($scope.tutorial.notes.slice(0));
                        $scope.newSort();


                        $scope.closeInput();

                        LoggerService.log("Submitted a note:"
                         + " Tutorial - " + $scope.tutorial.title
                         + " | Category - comment"
                         + " | Extra Input - " + $scope.extraInput
                         + " | Note - " + $scope.newNote);

                    }
                };

                $scope.findStepIndex=function(id){
                    for(var g=0; g<$scope.tutorial.steps.length; g++){
                        if($scope.tutorial.steps[g].id===id){
                            return parseInt(g);
                        }
                    }
                    return -1;
                };

                $scope.findNoteIndex=function(reply){
                    for(var g=0; g<$scope.tutorial.notes.length; g++){
                        if($scope.tutorial.notes[g].id===reply){
                            return parseInt(g);
                        }
                    }
                    return -1;
                };

                $scope.deleteNote = function(note_id){
                    $scope.deleteChange = true;
                    TutorialService.put($scope.findNote(note_id),$scope.deleteChange, $scope.ratingChange);

                    $scope.deleteChange = false;

                    LoggerService.log("Deleted a note:"
                        + " Tutorial - " + $scope.tutorial.title
                        + " | Extra Input - " + $scope.extraInput
                        + " | Note - " + $scope.newNote);

                };

                $scope.findNote = function(note_id)
                {
                    for(var i =0; i < $scope.tutorial.notes.length; i++) {
                        if($scope.tutorial.notes[i].id === note_id) {
                            return $scope.tutorial.notes[i];
                        }
                    }
                    return null;
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

                $scope.showContributors = function(show) {
                    LoggerService.log("Toggled contributor list: "
                        + " Tutorial - " + $scope.tutorial.title
                        + " | Visibility - " + !show);

                    return !show;
                };

                $scope.dateFormat = function(note){
                    return moment(note.dateSubmitted).format("YYYY-MM-DD");
                };

                $scope.orderDate = function(list){
                    var tempNote1;
                    var tempNote2;
                    var index;
                    for(var j = 0; j < list.length; j++){
                        tempNote1 = list[j];
                        for(var k=j; k<list.length; k++){
                            if(moment(list[k].dateSubmitted).isAfter(moment(tempNote1.dateSubmitted))){
                                tempNote1 = list[k];
                                index = k;
                            }
                        }
                        if(tempNote1 != list[j]){
                            tempNote2 = list[j];
                            list[j] = tempNote1;
                            list[index]=tempNote2;
                        }
                    }
                };

                $scope.orderRating = function(list){
                    var tempNote1;
                    var tempNote2;
                    var index;
                    for(var j = 0; j < list.length; j++){
                        tempNote1 = list[j];
                        for(var k=j; k<list.length; k++){
                            if(parseInt(list[k].rating)>parseInt(tempNote1.rating)){
                                tempNote1 = list[k];
                                index = k;
                            }
                        }
                        if(tempNote1 != list[j]){
                            tempNote2 = list[j];
                            list[j] = tempNote1;
                            list[index]=tempNote2;
                        }
                    }
                }

            });
    });