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
                $scope.chosenSort ="new";
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

                        LoggerService.log("Pressed Reply:"
                            + " Tutorial - " + $scope.tutorial.title
                            + " Interface - FreeForm"
                            + " | Note - " + $scope.findNote(id).content);
                    }else{
                        $scope.replyTo=null;
                        $scope.replyToContributor=null;
                        $scope.replyStep=null;

                        LoggerService.log("Cancelled Reply:"
                            + " Tutorial - " + $scope.tutorial.title
                            + " Interface - FreeForm"
                            + " | Note - " + $scope.findNote(id).content);
                    }

                };

                $scope.newSort = function(){
                  if($scope.chosenSort==="new" || $scope.chosenSort === undefined || $scope.chosenSort === null|| $scope.chosenSort==="old"){
                      $scope.orderDate($scope.listOfNotes);
                      if($scope.chosenSort==="old") {
                        $scope.listOfNotes.reverse();
                      }
                  }else if($scope.chosenSort=="high" || $scope.chosenSort=="low"){
                      $scope.orderRating($scope.listOfNotes);
                        if($scope.chosenSort=="low") {
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

                    LoggerService.log("Closed input dialog" + " Tutorial - " + $scope.tutorial.title);
                };

                $scope.submitNote = function(){
                    $scope.inputCategory = "comment";
                    $scope.extraInput = "";
                    console.log($scope.listOfNotes.length);
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

                        if($scope.replyTo!==null){
                            note.category = "reply";
                        }

                        var returnedNote = TutorialService.post(note).then(function(result){
                            $scope.newNote = result;
                            console.log($scope.newNote);
                            if($scope.replyTo){
                                $scope.tutorial.notes[$scope.findNoteIndex($scope.newNote.reply_to)].replies.push($scope.newNote);
                            }

                            $scope.tutorial.notes.push($scope.newNote);

                            $scope.listOfNotes = ($scope.tutorial.notes.slice(0));
                            $scope.newSort();
                            console.log($scope.listOfNotes.length);
                            $scope.closeInput();
                        });


                        LoggerService.log("Submitted a note:"
                         + " Tutorial - " + $scope.tutorial.title
                         + " Interface - FreeForm"
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

                $scope.sortSelected = function(sort){
                    $scope.chosenSort = sort;

                    LoggerService.log("Sort selected"
                        + " Tutorial - " + $scope.tutorial.title
                        + " Interface - FreeForm"
                        + " | Sort - " + sort);
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
                        + " Interface - FreeForm"
                        + " | Note - " + $scope.findNote(note_id).content);

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

                    LoggerService.log("Rated a note:"
                        + " Tutorial - " + $scope.tutorial.title
                        + " Interface - FreeForm"
                        + " | Note - " + $scope.newNote);
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
                        + " Interface - FreeForm"
                        + " | Category - " + category
                        + " | Visibility - " + !show
                        + " | Step - " + step.html.substr(0, 50) + "...");

                    return !show;
                };

                $scope.showContributors = function(show) {
                    LoggerService.log("Toggled contributor list: "
                        + " Tutorial - " + $scope.tutorial.title
                        + " Interface - FreeForm"
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
                            if(parseInt(list[k].contributor_list.length)>parseInt(tempNote1.contributor_list.length)){
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