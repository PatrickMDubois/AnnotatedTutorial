/* 
 * An Angular service which helps with creating recursive directives.
 * @author Mark Lagendijk
 * @license MIT
 * http://stackoverflow.com/questions/14430655/recursion-in-angular-directives
 */
angular.module('RecursionHelper', []).factory('RecursionHelper', ['$compile', function($compile){
    return {
        /**
         * Manually compiles the element, fixing the recursion loop.
         * @param element
         * @param [link] A post-link function, or an object with function(s) registered via pre and post properties.
         * @returns An object containing the linking functions.
         */
        compile: function(element, link){
            // Normalize the link parameter
            if(angular.isFunction(link)){
                link = { post: link };
            }

            // Break the recursion loop by removing the contents
            var contents = element.contents().remove();
            var compiledContents;
            return {
                pre: (link && link.pre) ? link.pre : null,
                /**
                 * Compiles and re-adds the contents
                 */
                post: function(scope, element){
                    // Compile the contents
                    if(!compiledContents){
                        compiledContents = $compile(contents);
                    }
                    // Re-add the compiled contents to the element
                    compiledContents(scope, function(clone){
                        element.append(clone);
                    });

                    // Call the post-linking function, if any
                    if(link && link.post){
                        link.post.apply(null, arguments);
                    }
                }
            };
        }
    };
}]);
(function(w) {
    'use strict';

    w.app = angular.module('AnnotatedTutorial', ['app-templates', 'ngSanitize', 'angularMoment', 'RecursionHelper']);

    app.factory('annotatedTutorialServer', function() {
        if (typeof(DEVELOPMENT) === 'undefined') {
            return 'http://rengas.cs.umanitoba.ca';
            //return '//dorado.cs.umanitoba.ca:8000'; // production environment
        } else {
            return 'http://127.0.0.1:8000'; // development environment
        }
    });

    app.factory('currentParticipant', function() {
        var pseudonym = 'Koala'//'Assiniboine';//localStorage.getItem('pseudonym');

        if (!pseudonym) {
            while (!pseudonym) {
                pseudonym = prompt('Please, enter your pseudonym');
            }

            localStorage.setItem('pseudonym', pseudonym);
          }

        return pseudonym;
    });

})(window);
function Log(data) {
    this.message = data.msg;
    this.participant_id = data.participantId;
    this.created_at = moment().format();
}

angular.module('AnnotatedTutorial')
    .factory('LoggerService', function(annotatedTutorialServer, currentParticipant, $http) {
        'use strict';

        return {
            log: function(msg) {
                var log = new Log({
                  msg: msg,
                  participantId: currentParticipant
                });

                //$http.post('http://127.0.0.1:8000/logger/logs', log);
                $http.post(annotatedTutorialServer + '/logger/logs', log);
            }
        }
    });
function Note(data) {
    this.step_id = data.step_id;
    this.tutorial_id = data.tutorial_id;
    this.category = data.category;
    this.extra_info = data.extra_info;
    this.content = data.content;
    this.contributor = data.contributor;
    this.user_submitted = data.user_submitted;
    this.reply_to = data.reply_to;
    this.deleted= data.deleted;
    this.dateSubmitted=moment();
    this.contributor_list = [];
}

angular.module('AnnotatedTutorial')
    .factory('TutorialService', function($http, annotatedTutorialServer, currentParticipant){
        'use strict';

        var contributor = null;
        var promise = $http.get(annotatedTutorialServer + '/tutorials/contributor/' + currentParticipant)
            .then(function(response) {

                contributor = response.data;
            });

        return {
            loaded: promise,
            get: function() {
                return contributor;
            },
            post: function(note) {
                var theNote = new Note({
                    step_id: note.step_id,
                    tutorial_id: note.tutorial_id,
                    category: note.category,
                    extra_info: note.extra_info,
                    content: note.content,
                    contributor: note.contributor,
                    user_submitted: true,
                    reply_to: note.reply_to,
                    deleted:false
                });
                var newNote;
                var promise2 = $http.post(annotatedTutorialServer + '/tutorials/notes', theNote)
                .then(function(response) {
                        newNote = response.data;
                        return newNote;
                });
                return promise2;
            },
            put: function(note,deleteChange, ratingChange){

                if(deleteChange == true) {
                    note.deleted = true;
                }else if(ratingChange == true){
                    var index = -1;
                    if(note.contributor_list !== undefined){
                        index = note.contributor_list.indexOf(contributor.id);
                    }
                    if(index == -1){
                        note.contributor_list.push(contributor.id);
                    }else{
                        note.contributor_list.splice(index,1);
                    }

                }
                $http.put(annotatedTutorialServer + '/tutorials/note/update/' + note.id,note);

            }
        };
    });
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

                $scope.currentStep=[];

                //A note's list of steps it is associated with
                $scope.stepList =[];
                $scope.selectedStepsList = [];
                $scope.secondMenu = false;
                $scope.ratingChange = false;
                $scope.deleteChange = false;

                //the list of contributors
                for(var i = 0; i < $scope.tutorial.notes.length; i++) {
                    if($scope.listOfContributors.indexOf($scope.tutorial.notes[i].contributor) == -1) {
                        if(!$scope.tutorial.notes[i].user_submitted || $scope.tutorial.notes[i].contributor === $scope.contributor.name) {
                            $scope.listOfContributors.push(($scope.tutorial.notes[i].contributor));
                        }
                    }
                }
                //The list of steps in order by their step number
                for(var g = 0; g < $scope.tutorial.steps.length; g++) {
                    for(var j = 0; j < $scope.tutorial.steps.length; j++) {
                        if ($scope.tutorial.steps[j].step_number == g) {
                            $scope.listOfSteps.push($scope.tutorial.steps[j]);
                            break;
                        }
                    }
                }

                $scope.windowHeight = window.innerHeight - 88; // from stylesheet

                $scope.resetCurrent=function(){
                    $scope.currentStep.splice(0,$scope.currentStep.length);
                };

                $scope.lineClicked = function(index, $event,step){

                    $scope.selectedLine = index;
                    $scope.inputPos = $event.pageY;
                    $scope.currentStep.push(step);

                    LoggerService.log("Opened input dialog"
                        + " Tutorial - " + $scope.tutorial.title  
                        + " Interface - Embedded");
                };

                $scope.addingReply = function($index, $event, id, contributor, step){

                    $scope.replyTo =id;
                    $scope.replyToContributor = contributor;
                    $scope.replyStep = step;
                    $scope.selectedStepsList = step.concat($scope.selectedStepsList);
                    $scope.lineClicked($index,$event,step);
                    LoggerService.log("Pressed Reply:"
                        + " Tutorial - " + $scope.tutorial.title
                        + " Interface - Embedded"
                        + " | Note - " + $scope.findNote(id).content.substring(0,150));
                };

                $scope.categorySelected = function(category){
                    $scope.showTextarea = true;
                    $scope.inputCategory = category;
                    $scope.extraInput = "";

                    LoggerService.log("Changed input to category: " + category
                        + " Tutorial - " + $scope.tutorial.title
                        + " Interface - Embedded");
                };

                $scope.stepAdded = function(step){
                    $scope.selectedStepsList.push(step);
                };

                $scope.stepRemoved = function(step,index){
                    $scope.selectedStepsList.splice(index,1);
                };

                $scope.stepSelected=function(step){
                    var index = $scope.selectedStepsList.indexOf(step);
                    if(index== -1){
                        $scope.stepAdded(step);
                        LoggerService.log("Step Added:"
                            + " Tutorial - " + $scope.tutorial.title
                            + " Interface - Embedded"
                            + " | Step - " + $scope.selectedLine);
                    }else{
                        $scope.stepRemoved(step,index);
                        LoggerService.log("Step Removed"
                            + " Tutorial - " + $scope.tutorial.title
                            + " Interface - Embedded"
                            + " | Step - " + $scope.selectedLine);
                    }

                };

                $scope.preview = function(step){
                    LoggerService.log("Preview clicked"
                        + " Tutorial - " + $scope.tutorial.title
                        + " Interface - Embedded"
                        + " | Step - " + step.step_number);

                    return true;
                };

                $scope.return = function(step){
                    LoggerService.log("Return clicked"
                        + " Tutorial - " + $scope.tutorial.title
                        + " Interface - Embedded"
                        + " | Step - " + step.step_number);

                    return true;
                };

                $scope.numberList=function(){
                    $scope.list=[];
                    for(var i =0; i < $scope.selectedStepsList.length; i++){
                        if($scope.selectedStepsList[i].step_number >0 && $scope.selectedStepsList[i].step_number < ($scope.listOfSteps.length-2)) {
                            $scope.list.push($scope.selectedStepsList[i].step_number);
                        }else if($scope.selectedStepsList[i].step_number==$scope.listOfSteps.length-2){
                            $scope.list.push("END");
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
                    $scope.resetCurrent();
                    LoggerService.log("Closed input dialog: " 
                        + " Tutorial - " + $scope.tutorial.title
                        + " Interface - Embedded");
                };

                $scope.submitNote = function(){

                    if($scope.replyTo!==null && $scope.newNote){

                        $scope.selectedLine = null;
                        $scope.inputCategory = "reply";
                        $scope.extraInput = "";
                    }

                    if(($scope.selectedStepsList!==null||$scope.replyTo!==null)){
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

                        $scope.newNote = null;
                        var returnedNote = TutorialService.post(note).then(function(result){
                            $scope.newNote = result;

                            $scope.newNote.replies=[];
                            $scope.tutorial.notes.push($scope.newNote);
                            $scope.addNote($scope.newNote);
                            $scope.closeInput();

                            LoggerService.log("Submitted a note:"
                                + " Tutorial - " + $scope.tutorial.title
                                + " Interface - Embedded"
                                + " | Step - " + $scope.selectedLine
                                + " | Category - " + $scope.inputCategory
                                + " | Extra Input - " + $scope.extraInput
                                + " | Note - " + $scope.newNote.content);
                        });


                    }
                };

                $scope.findStepIndex=function(id){
                    for(var g=0; g<$scope.listOfSteps.length; g++){
                        if($scope.listOfSteps[g].id===id){
                            return parseInt(g);
                        }
                    }
                    return -1;
                };

                $scope.addNote = function(note){
                    var firstNote = $scope.findNote(note.reply_to);
                    var stepNumber;
                    var stepIndex;
                    var mainIndex;
                    var mainNote;
                    var firstIndex;
                    var index;

                    if(firstNote !== null && firstNote.reply_to == null) { //new note posted, first level of reply
                        for(var m = 0; m<note.step_id.length; m++) {
                            stepNumber = $scope.findStepNumber(note.step_id[m]);
                            stepIndex = $scope.findStepIndex(note.step_id[m]);
                            index = $scope.findNoteInStep(stepNumber,firstNote.id);
                            $scope.tutorial.steps[stepIndex].notes[index].replies.push(note);
                        }
                    }else if(firstNote === null){//new note posted
                        for(var g=0; g<$scope.newNote.step_id.length; g++){
                            $scope.tutorial.steps[$scope.findStepIndex($scope.newNote.step_id[g])].notes.push(note);
                        }
                        $scope.tutorial.notes.push(note);
                    }else{ //new note posted, second level of reply
                        for(var d = 0; d < note.step_id.length; d++) {
                            stepNumber = $scope.findStepNumber(note.step_id[d]);
                            stepIndex = $scope.findStepIndex(note.step_id[d]);
                            mainIndex = $scope.findNoteInStep(stepNumber, firstNote.reply_to);
                            mainNote = $scope.tutorial.steps[stepIndex].notes[mainIndex];
                            firstIndex = $scope.findReplyIndex(note.reply_to, mainNote);
                            $scope.tutorial.steps[stepIndex].notes[mainIndex].replies[firstIndex].replies.push(note);
                        }

                    }
                };

                $scope.update = function(note){
                    var firstNote = $scope.findNote(note.reply_to);
                    var mainIndex;
                    var mainNote;
                    var firstIndex;
                    var index;
                    var stepNumber;
                    var stepIndex;

                    if(firstNote !== null && firstNote.reply_to == null){ //new rating or deletion, first level of reply
                        stepNumber= $scope.findStepNumber(note.step_id[0]);
                        stepIndex = $scope.findStepIndex(note.step_id[0]);
                        firstNote = $scope.tutorial.steps[stepIndex].notes[$scope.findNoteInStep(stepNumber, firstNote.id)];
                        for(var k = 0; k<note.step_id.length; k++) {
                            stepNumber = $scope.findStepNumber(note.step_id[k]);
                            stepIndex = $scope.findStepIndex(note.step_id[k]);
                            index = $scope.findNoteInStep(stepNumber,firstNote.id);
                            var noteIndex = $scope.findReplyIndex(note.id, firstNote);
                            firstNote.replies[noteIndex] = note;
                            $scope.tutorial.steps[stepIndex].notes[index] = firstNote;
                        }
                    }else if(firstNote !== null && firstNote.reply_to !== null){ //new rating or deletion, second level of reply
                        for(var z = 0; z<note.step_id.length; z++) {
                            stepNumber = $scope.findStepNumber(note.step_id[z]);
                            stepIndex = $scope.findStepIndex(note.step_id[z]);
                            mainIndex = $scope.findNoteInStep(stepNumber, firstNote.reply_to);
                            mainNote = $scope.tutorial.steps[stepIndex].notes[mainIndex];
                            firstIndex = $scope.findReplyIndex(note.reply_to, mainNote);
                            var replyIndex = $scope.findReplyIndex(note.id, firstNote);
                            firstNote.replies[replyIndex] = note;
                            mainNote.replies[firstIndex] = firstNote;
                            $scope.tutorial.steps[stepIndex].notes[mainIndex] = mainNote;
                        }

                    }else{ //new rating or deletion on a note
                        stepNumber= $scope.findStepNumber(note.step_id[0]);
                        stepIndex = $scope.findStepIndex(note.step_id[0]);
                        var oldNote = note;
                        note = $scope.tutorial.steps[stepIndex].notes[$scope.findNoteInStep(stepNumber, note.id)];
                        note.deleted = oldNote.deleted;
                        note.contributor_list = oldNote.contributor_list;
                        for(var i = 0; i<note.step_id.length; i++){
                            stepNumber = $scope.findStepNumber(note.step_id[i]);
                            stepIndex = $scope.findStepIndex(note.step_id[i]);
                            index = $scope.findNoteInStep(stepNumber, note.id);
                            $scope.tutorial.steps[stepIndex].notes[index] = note;
                        }
                    }

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



                $scope.dateFormat = function(note){
                    return moment(note.dateSubmitted).format("YYYY-MM-DD");
                };

                $scope.getNoteList = function(note){
                    $scope.stepList.splice(0,$scope.stepList.length);
                    var stringList = "";
                    for(var i =0; i < note.step_id.length; i++){
                        var num = $scope.findStepNumber(note.step_id[i]);
                        if(num < 1){
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

                $scope.findNoteIndex=function(reply){
                    for(var g=0; g<$scope.tutorial.notes.length; g++){
                        if($scope.tutorial.notes[g].id===reply){
                            return parseInt(g);
                        }
                    }
                    return -1;
                };

                $scope.findNoteInStep=function(step_number, note_id){
                    for(var g=0; g<$scope.tutorial.steps[step_number].notes.length; g++){
                        if($scope.tutorial.steps[step_number].notes[g].id===note_id){
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
                    TutorialService.put(note,$scope.deleteChange, $scope.ratingChange);

                    $scope.update(note);

                    $scope.deleteChange = false;

                    LoggerService.log("Deleted a note:"
                        + " Tutorial - " + $scope.tutorial.title
                        + " Interface - Embedded"
                        + " | Note - " + $scope.findNote(note_id).content.substring(0,150));

                };

                $scope.clear = function(){
                  $scope.contributor = TutorialService.get();
                  $scope.tutorial = $scope.contributor.current_tutorial;
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
                    TutorialService.put(note,$scope.deleteChange, $scope.ratingChange);

                    $scope.update(note);

                    $scope.ratingChange = false;
                    LoggerService.log("Rated a note:"
                        + " Tutorial - " + $scope.tutorial.title
                        + " Interface - Embedded"
                        + " | Note - " + $scope.findNote(note_id).content.substring(0,150));
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
                        + " Interface - Embedded"
                        + " | Category - " + category
                        + " | Visibility - " + !show
                        + " | Step - " + step.html.substr(0, 50) + "...");

                    return !show;
                };

                $scope.showContributors = function(show) {
                    LoggerService.log("Toggled contributor list: "
                        + " Tutorial - " + $scope.tutorial.title
                        + " Interface - Embedded"
                        + " | Visibility - " + !show);

                    return !show;
                };

                $scope.menuSwitch=function(){
                    if(!$scope.secondMenu && $scope.selectedStepsList.length == 0){
                        confirm("Please select a step.");
                    }else{
                        $scope.secondMenu = !$scope.secondMenu;
                        LoggerService.log("Menu switched:"
                            + " Tutorial - " + $scope.tutorial.title
                            + " Interface - Embedded");
                    }

                };

                $scope.noteOrder = function(step){
                    var tempNote1;
                    var tempNote2;
                    var index;
                    for(var j = 0; j < step.notes.length; j++){
                        tempNote1 = step.notes[j];
                        for(var k=j; k<step.notes.length; k++){
                            if(step.notes[k].rating>tempNote1.rating){
                                tempNote1 = step.notes[k];
                                index = k;
                            }
                        }
                        if(tempNote1 != step.notes[j]){
                            tempNote2 = step.notes[j];
                            step.notes[j] = tempNote1;
                            step.notes[index]=tempNote2;
                        }
                    }
                }

            });
    });
angular.module('AnnotatedTutorial')
    .directive('note', function(RecursionHelper) {
        'use strict'

        return {
            restrict: 'E',
            templateUrl: 'note.html',
            scope: {note: '=',deleteIt: '=',rateIt:"=", addReply: '=', canShowNote: '=', user: '=', date: '=',currentNote:'=', notelist:'=', replyOne: '=', currentReply:'='},
            compile: function(element) {
                return RecursionHelper.compile(element, function(scope, iElement, iAttrs, controller, transcludeFn){});
            }
        };
    });
/**
 * Created by patrick on 01/06/17.
 */
    $(document).ready(function(){
        // Add smooth scrolling to all links
        $("a").on('click', function(event) {

            // Make sure this.hash has a value before overriding default behavior
            if (this.hash !== "") {
                // Prevent default anchor click behavior
                event.preventDefault();

                // Store hash
                var hash = this.hash;

                // Using jQuery's animate() method to add smooth page scroll
                // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
                $('html, body').animate({
                    scrollTop: $(hash).offset().top
                }, 800, function(){

                    // Add hash (#) to URL when done scrolling (default click behavior)
                    window.location.hash = hash;
                });
            } // End if
        });
    });