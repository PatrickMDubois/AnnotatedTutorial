angular.module('AnnotatedTutorial')
    .controller('mainController', function($scope, TutorialService, LoggerService){
        'use strict';

        TutorialService.loaded
        .then(function() {
                //loading up the correct tutorial for the current interface
                $scope.contributor = TutorialService.get();
                if($scope.contributor.current_interface.url == $scope.contributor.interface_one.url){
                    $scope.tutorial = $scope.contributor.tutorial_one;
                }else if($scope.contributor.current_interface.url == $scope.contributor.interface_two.url){
                    $scope.tutorial = $scope.contributor.tutorial_two;
                }else{
                    $scope.tutorial = $scope.contributor.tutorial_three;
                }

                $scope.newNote = "";
                $scope.extraInput = "";
                $scope.inputCategory = "";
                $scope.replyTo = null;
                $scope.replyToContributor = "";
                $scope.listOfContributors = [];
                $scope.listOfSteps = [];
                $scope.chosenSort ="new";
                $scope.level=0;

                //if someone has liked a comment or pressed delete
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

                $scope.setLevel=function(value){
                    $scope.level=value;
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
                            if(result == null){
                                prompt("There was an error posting your note please refresh the page and try again.");
                                LoggerService.log("Error to post a note:"
                                    + " Tutorial - " + $scope.tutorial.title
                                    + " Interface - FreeForm"
                                    + " | Category - comment"
                                    + " | Extra Input - " + $scope.extraInput
                                    + " | Note - " + $scope.newNote);
                            }else{
                                $scope.newNote = result.data;

                                if($scope.replyTo){
                                    $scope.update($scope.newNote,true);
                                }
                                $scope.newNote.replies=[];
                                $scope.tutorial.notes.push($scope.newNote);

                                $scope.listOfNotes = ($scope.tutorial.notes.slice(0));
                                $scope.newSort();
                                $scope.closeInput();

                                LoggerService.log("Submitted a note:"
                                    + " Tutorial - " + $scope.tutorial.title
                                    + " Interface - FreeForm"
                                    + " | Category - comment"
                                    + " | Extra Input - " + $scope.extraInput
                                    + " | Note - " + $scope.newNote);
                            }
                        });
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
                    var note = $scope.findNote(note_id);
                    TutorialService.put(note,$scope.deleteChange, $scope.ratingChange);

                    $scope.update(note,false);

                    $scope.deleteChange = false;

                    LoggerService.log("Deleted a note:"
                        + " Tutorial - " + $scope.tutorial.title
                        + " Interface - FreeForm"
                        + " | Note - " + $scope.findNote(note_id).content);

                };

                $scope.update=function(note,newNote){
                    var firstNote = $scope.findNote(note.reply_to);
                    var mainIndex;
                    var mainNote;
                    var firstIndex;
                    var index;

                    if(newNote && firstNote !== null && firstNote.reply_to !== null){ //second level
                        mainIndex = $scope.findNoteIndex(firstNote.reply_to);
                        mainNote = $scope.findNote(firstNote.reply_to);
                        firstIndex = $scope.findReplyIndex(note.reply_to,mainNote);
                        $scope.tutorial.notes[mainIndex].replies[firstIndex].replies.push($scope.newNote);

                    }else if(newNote && firstNote !== null){ //first level
                        index = $scope.findNoteIndex($scope.newNote.reply_to);
                        $scope.tutorial.notes[index].replies.push($scope.newNote);

                    }else if(firstNote !== null && firstNote.reply_to !== null){ //second

                        mainNote = $scope.findNote(firstNote.reply_to);
                        mainIndex =  $scope.findNoteIndex(note.reply_to.reply_to);
                        firstIndex = $scope.findReplyIndex(note.reply_to,mainNote);
                        var replyIndex = $scope.findReplyIndex(note.id,firstNote);
                        firstNote.replies[replyIndex] = note;
                        mainNote.replies[firstIndex] = firstNote;
                        $scope.tutorial.notes[mainIndex] = mainNote;

                    }else if(firstNote !== null){
                        index = $scope.findNoteIndex(firstNote.id);
                        var noteIndex = $scope.findReplyIndex(note.id,firstNote);
                        firstNote.replies[noteIndex] = note;
                        $scope.tutorial.notes[index] = firstNote;
                    }
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

                $scope.findReplyIndex=function(reply, parent){
                    for(var g=0; g<parent.replies.length; g++){
                        if(parent.replies[g].id===reply){
                            return parseInt(g);
                        }
                    }
                    return -1;
                };

                $scope.findReply=function(reply, parent){
                    for(var g=0; g<parent.replies.length; g++){
                        if(parent.replies[g].id===reply){
                            return parent.replies[g];
                        }
                    }
                    return -1;
                };

                $scope.findSecondary=function(reply){
                    for(var g=0; g<$scope.tutorial.notes.length; g++){
                        for(var k = 0; k < $scope.tutorial.notes[g].replies.length; k++ )
                        {
                            if ($scope.tutorial.notes[g].replies[k].id === reply) {
                                return $scope.tutorial.notes[g].replies[k];
                            }
                        }
                    }
                    return null;
                };

                $scope.hasReply= function(note){
                    if(note.replies == undefined){
                        return true;
                    }

                    for(var i = 0; i< note.replies.length; i++){
                        if(note.replies[i].deleted == false){
                            return true;
                        }
                    }
                    return false;
                };

                $scope.newRating = function(note_id){
                    $scope.ratingChange = true;
                    var note = $scope.findNote(note_id);
                    var mainNote = $scope.findNote(note.reply_to);
                    TutorialService.put(note,$scope.deleteChange, $scope.ratingChange);
                    $scope.update(note,false);
                    $scope.ratingChange = false;
                    $scope.listOfNotes = $scope.tutorial.notes.slice(0);
                    $scope.newSort();

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

                //to set the starting filter
                $scope.chosenSort = "new";
                $scope.newSort();

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