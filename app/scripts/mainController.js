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
                $scope.newFirst = true;
                $scope.currentStep=[];
                $scope.selectedStepsList = [];
                $scope.secondMenu = false;
                $scope.ratingChange = false;
                $scope.deleteChange = false;

                $scope.noteStepList=[];
                $scope.currentNote=null;
                $scope.stepFilter = [];
                $scope.categoryFilter = null;
                $scope.general = false;
                $scope.menuOpen = false;
                $scope.stepList = [];
                $scope.itemArray = [
                    {id: 0, name: 'intro'}
                ];
                $scope.selectedItem = $scope.itemArray[0];

                $scope.listOfNotes = ($scope.tutorial.notes.slice(0)).reverse();

                for(var i = 0; i < $scope.tutorial.notes.length; i++) {
                    if($scope.listOfContributors.indexOf($scope.tutorial.notes[i].contributor) == -1) {
                        if(!$scope.tutorial.notes[i].user_submitted || $scope.tutorial.notes[i].contributor === $scope.contributor.name) {
                            $scope.listOfContributors.push(($scope.tutorial.notes[i].contributor));
                        }
                    }
                }
                for(var g = 0; g < $scope.tutorial.steps.length; g++) {
                    for(var j = 0; j < $scope.tutorial.steps.length; j++) {
                        if ($scope.tutorial.steps[j].step_number == g) {
                            $scope.listOfSteps.push($scope.tutorial.steps[j]);
                            break;
                        }
                    }
                }

                for(var k = 1; k < $scope.listOfSteps.length; k++){
                    var newItem = {};
                    newItem['id'] = k;
                    if(k< $scope.listOfSteps.length-2) {

                        newItem['name'] = k;
                    }else if(k=== $scope.listOfSteps.length-2){
                        newItem['name'] = "end";
                    }else{
                        newItem['name'] = "general";
                    }
                    $scope.itemArray.push(newItem);
                }

                $scope.windowHeight = window.innerHeight - 88; // from stylesheet

                $scope.resetCurrent=function(){
                    $scope.currentStep.splice(0,$scope.currentStep.length);
                };

                $scope.lineClicked = function(index, $event,step){

                    $scope.selectedLine = index;
                    $scope.inputPos = $event.pageY;
                    $scope.currentStep.push(step);
                    $scope.menuOpen = true;

                    LoggerService.log("Opened input dialog"
                         + " Tutorial - " + $scope.tutorial.title
                         + " Interface - Side Display");
                };
                $scope.chosenGeneral = function(){
                    if(!$scope.general) {
                        $scope.selectedStepsList.splice(0, $scope.selectedStepsList.length);
                    }
                    $scope.general = !$scope.general;
                    for(var i = 0; i <$scope.listOfSteps.length-1; i++){
                        var stepID = "step " + i;
                        document.getElementById(stepID).disabled = $scope.general;
                    }
                    document.getElementById("general").disabled = true;
                };

                $scope.addingReply = function($index, $event, id, contributor, step){

                    $scope.replyTo =id;
                    $scope.replyToContributor = contributor;
                    $scope.replyStep = step;
                    $scope.selectedStepsList = step.concat($scope.selectedStepsList);
                    $scope.lineClicked($index,$event,step);
                    LoggerService.log("Pressed Reply:"
                        + " Tutorial - " + $scope.tutorial.title
                        + " Interface - Side Display"
                        + " | Note - " + $scope.findNote(id).content);
                };

                $scope.getDropdownList = function(){
                    var list = [];

                    list.push({id: 0, name: "INTRO"});
                    for(var i = 1; i < $scope.listOfSteps.length-2; i++){
                        list.push({id:i, name: $scope.listOfSteps[i].step_number});
                    }
                    list.push({id: $scope.listOfSteps.length-2, name: "END"});
                    list.push({id: $scope.listOfSteps.length-1, name:"GENERAL"});
                    return list;
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
                  }else if(chosenSort=="category"){
                      var newList = ($scope.filterByCategory('corrections',$scope.listOfNotes.slice(0)));
                      newList = newList.concat($scope.filterByCategory('details',$scope.listOfNotes.slice(0)));
                      newList = newList.concat($scope.filterByCategory('questions',$scope.listOfNotes.slice(0)));
                      newList = newList.concat($scope.filterByCategory('other',$scope.listOfNotes.slice(0)));
                      $scope.listOfNotes = newList;
                  }
                };
                $scope.clear = function(){
                  $scope.listOfNotes = ($scope.tutorial.notes.slice(0)).reverse();
                  $scope.newSort();
                  $scope.categoryFilter = null;
                  $scope.stepFilter.splice(0,$scope.stepFilter.length);
                  $scope.currentNote = null;
                  $scope.noteStepList.splice(0,$scope.noteStepList.length);

                  LoggerService.log("Pressed Clear:"
                      + " Tutorial - " + $scope.tutorial.title
                      + " Interface - Side Display");
                    return false;
                };

                $scope.newFilter = function(value){

                    if(typeof value === 'string') {
                        if(value=== $scope.categoryFilter){
                            $scope.categoryFilter = null;
                        }else{
                            $scope.categoryFilter = value;
                        }
                    }
                    else{
                        var index = $scope.stepFilter.indexOf(value);
                        if( index >= 0){
                            $scope.stepFilter.splice(index,1);
                        }else{
                            $scope.stepFilter.push(value);
                        }

                    }
                    if($scope.categoryFilter!== null && $scope.stepFilter.length!==0){
                        $scope.getStepFilterNotes();
                        $scope.listOfNotes = $scope.filterByCategory($scope.categoryFilter,$scope.listOfNotes);
                    }else if($scope.stepFilter.length !== 0){
                        $scope.getStepFilterNotes();
                    }else if($scope.categoryFilter!== null){
                        $scope.listOfNotes = $scope.filterByCategory($scope.categoryFilter,($scope.tutorial.notes.slice(0)));
                    }else if($scope.stepFilter.length< 1 || $scope.categoryFilter == null){
                        $scope.listOfNotes = ($scope.tutorial.notes.slice(0));
                    }
                    $scope.newSort();
                };

                $scope.stepIcon = function(step){
                    $scope.newFilter(parseInt(step.step_number));
                };

                $scope.getStepNumber=function(){
                  for(var i =0; i < chosenFilter.length; i++){
                      chosenFilter[i] = parseInt(chosenFilter[i].id);
                  }
                };

                $scope.getStepFilterNotes=function(){
                    $scope.listOfNotes.splice(0,$scope.listOfNotes.length);
                    for(var i =0; i < $scope.stepFilter.length; i++){
                        $scope.listOfNotes= $scope.listOfNotes.concat(($scope.tutorial.steps[$scope.stepFilter[i]].notes).slice(0));
                    }
                };


                $scope.filterByCategory = function(category,list){
                    var tempList=[];
                    for(var i = 0; i < list.length; i++){
                        if(list[i].category == category){
                            tempList.push(list[i]);
                        }
                    }
                    return (tempList.slice(0));

                };

                $scope.getNoteList = function(note){
                    $scope.stepList.splice(0,$scope.stepList.length);
                    var stringList = "";
                    for(var i =0; i < note.step_id.length; i++){
                        var num = $scope.findStepNumber(note.step_id[i]);
                        if(num == 0){
                            num = "INTRO";
                        }else if(num == $scope.listOfSteps.length-2){
                            num = "END";
                        }
                        $scope.stepList.push(num);
                    }
                    if($scope.stepList.length<=3){
                        stringList = $scope.stepList.toString();
                    }else{
                        stringList = $scope.stepList.slice(0,3).toString() + "+";
                    }

                    return stringList;
                };

                $scope.findStepNumber = function(stepID){
                  for(var j =0; j < $scope.listOfSteps.length; j++){
                      if($scope.listOfSteps[j].id === stepID){
                          return $scope.listOfSteps[j].step_number;
                      }
                  }
                    return null;
                };

                $scope.categorySelected = function(category){
                    $scope.showTextarea = true;
                    $scope.inputCategory = category;
                    $scope.extraInput = "";

                    LoggerService.log("Changed input to category: " + category
                        + " Tutorial - " + $scope.tutorial.title
                        + " Interface - Side Display");
                };

                $scope.stepAdded = function(step){
                    $scope.selectedStepsList.push(step);
                };

                $scope.stepRemoved = function(step,index){
                    $scope.selectedStepsList.splice(index,1);
                };

                $scope.stepSelected=function(step){
                    var index = $scope.selectedStepsList.indexOf(step);
                    if(index == -1){
                        $scope.stepAdded(step)
                    }else{
                        $scope.stepRemoved(step,index);
                    }
                };

                $scope.numberList=function(){
                    $scope.list=[];
                    for(var i =0; i < $scope.selectedStepsList.length; i++){
                        if($scope.selectedStepsList[i].step_number >0 && $scope.selectedStepsList[i].step_number < ($scope.listOfSteps.length-2)) {
                            $scope.list.push($scope.selectedStepsList[i].step_number);
                        }else if($scope.selectedStepsList[i].step_number==$scope.listOfSteps.length-2){
                            $scope.list.push("END");
                        }else if($scope.selectedStepsList[i].step_number==$scope.listOfSteps.length-1){
                            $scope.list.push("GENERAL");
                        }else{
                            $scope.list.push("INTRO");
                        }
                    }
                };

                $scope.closeInput = function(){
                    $scope.showTextarea = false;
                    $scope.inputCategory = "";
                    $scope.newNote = "";
                    $scope.extraInput = "";
                    $scope.selectedLine = null;
                    $scope.inputPos = null;
                    $scope.replyTo = null;
                    $scope.replyToContributor = "";
                    $scope.selectedStepsList.splice(0,$scope.selectedStepsList.length);
                    $scope.stepAdd = false;
                    $scope.secondMenu = false;
                    $scope.menuOpen = false;

                    LoggerService.log("Closed input dialog:"
                        + " Tutorial - " + $scope.tutorial.title
                        + " Interface - Side Display");
                };

                $scope.submitNote = function(){

                    if( $scope.replyTo!==null && $scope.newNote){

                        $scope.selectedLine = null;
                        $scope.inputCategory = "reply";
                        $scope.extraInput = "";
                    }
                    if(($scope.selectedStepsList!==null||$scope.replyTo!==null) && $scope.newNote){
                        var note = {
                            "step_id":$scope.selectedStepsList,
                            "tutorial_id": $scope.tutorial.id,
                            "category": $scope.inputCategory,
                            "extra_info": $scope.extraInput,
                            "content": $scope.newNote,
                            "contributor": $scope.contributor.name,
                            "reply_to": $scope.replyTo
                        };

                        if(!$scope.replyTo){
                            note.step_id = $scope.findStepId($scope.selectedStepsList);
                        }

                        var returnedNote = TutorialService.post(note).then(function(result){
                            $scope.newNote = result;
                            $scope.newNote.replies=[];
                            if($scope.replyTo){
                                $scope.tutorial.notes[$scope.findNoteIndex($scope.newNote.reply_to)].replies.push($scope.newNote);
                            }

                            $scope.tutorial.notes.push($scope.newNote);

                            if(!$scope.replyTo){
                                for(var index=0; index<$scope.newNote.step_id.length; index++){
                                    $scope.tutorial.steps[$scope.findStepIndex($scope.newNote.step_id[index])].notes.push($scope.newNote);
                                }
                            }

                            $scope.listOfNotes = ($scope.tutorial.notes.slice(0));
                            $scope.newSort();
                            $scope.closeInput();
                        });

                        LoggerService.log("Submitted a note:"
                         + " Tutorial - " + $scope.tutorial.title
                         + " Interface - Side Display"
                         + " | Step - " + $scope.selectedLine
                         + " | Category - " + $scope.inputCategory
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

                $scope.findNoteIndex=function(note){
                    for(var g=0; g<$scope.tutorial.notes.length; g++){
                        if($scope.tutorial.notes[g].id===note){
                            return parseInt(g);
                        }
                    }
                    return -1;
                };

                $scope.findReplyIndex=function(reply, parentIndex){
                    for(var g=0; g<$scope.tutorial.notes[parentIndex].replies.length; g++){
                        if($scope.tutorial.notes[parentIndex].replies[g].id===reply){
                            return parseInt(g);
                        }
                    }
                    return -1;
                };


                $scope.findStepId=function(list){
                    var idList = [];
                    for(var i =0; i < $scope.selectedStepsList.length; i++){
                        for(var j =0; j < $scope.listOfSteps.length; j++){
                            if($scope.listOfSteps[j].step_number === $scope.selectedStepsList[i].step_number){
                                idList.push($scope.listOfSteps[j].id);
                                break;
                            }
                        }
                    }
                    return idList;
                };

                $scope.deleteNote = function(note_id){
                    $scope.deleteChange = true;
                    var note = $scope.findNote(note_id);
                    var mainNote = $scope.findNote(note.reply_to);
                    TutorialService.put(note,$scope.deleteChange, $scope.ratingChange);
                    if(note.reply_to !== null){
                        var index = $scope.findNoteIndex (mainNote.id);
                        var replyIndex = $scope.findReplyIndex(note.id,index);
                        mainNote.replies[replyIndex] = note;
                        $scope.tutorial.notes[index] = mainNote;
                    }
                    $scope.deleteChange = false;

                    LoggerService.log("Deleted a note:"
                        + " Tutorial - " + $scope.tutorial.title
                        + "Interface - Side Display"
                        + " | Step - " + $scope.selectedLine
                        + " | Category - " + $scope.inputCategory
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
                    var note = $scope.findNote(note_id);
                    var mainNote = $scope.findNote(note.reply_to);
                    TutorialService.put(note,$scope.deleteChange, $scope.ratingChange);
                    if(note.reply_to !== null){
                        var index = $scope.findNoteIndex (mainNote.id);
                        var replyIndex = $scope.findReplyIndex(note.id,index);
                        mainNote.replies[replyIndex] = note;
                        $scope.tutorial.notes[index] = mainNote;
                    }

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
                        + "Interface - Side Display"
                        + " | Category - " + category
                        + " | Visibility - " + !show
                        + " | Step - " + step.html.substr(0, 50) + "...");

                    return !show;
                };

                $scope.showStepList = function(note){
                    if($scope.currentNote==null || note !== $scope.currentNote){
                        $scope.noteStepList = (note.step_id.slice(0));
                        $scope.currentNote=note;
                    }else{
                        $scope.noteStepList.splice(0,$scope.noteStepList.length);
                        $scope.currentNote=null;
                    }
                };


                $scope.showContributors = function(show) {
                    LoggerService.log("Toggled contributor list: "
                        + " Tutorial - " + $scope.tutorial.title
                        + "Interface - Side Display"
                        + " | Visibility - " + !show);

                    return !show;
                };

                $scope.menuSwitch=function(){
                    $scope.secondMenu = !$scope.secondMenu;
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

                chosenSort = "new";
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