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

    w.app = angular.module('AnnotatedTutorial', ['app-templates', 'ngSanitize', 'angularMoment', 'RecursionHelper','ui.select']);

    app.factory('annotatedTutorialServer', function() {
        if (typeof(DEVELOPMENT) === 'undefined') {
            return 'http://rengas.cs.umanitoba.ca';
            //return '//dorado.cs.umanitoba.ca:8000'; // production environment
        } else {
            return 'http://127.0.0.1:8000'; // development environment
        }
    });

    app.factory('currentParticipant', function() {
        var pseudonym=window.location.search.substring(1); //localStorage.getItem('pseudonym');

        if (!pseudonym) {
            /*while (!pseudonym) {
                pseudonym = "";//prompt('Please, enter your pseudonym');
            }

            localStorage.setItem('pseudonym', pseudonym);*/
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
                        var index = note.contributor_list.indexOf(contributor.id);
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
                $scope.newFirst = true;
                $scope.currentStep = [];
                $scope.selectedStepsList = [];
                $scope.secondMenu = false;
                $scope.ratingChange = false;
                $scope.deleteChange = false;
                $scope.chosenSort = null;
                $scope.noteStepList = [];
                $scope.currentNote = null;
                $scope.stepFilter = [];
                $scope.categoryFilter = null;
                $scope.general = false;
                $scope.menuOpen = false;
                $scope.stepList = [];

                $scope.temp = 0;
                $scope.listOfNotes = ($scope.tutorial.notes.slice(0)).reverse();

                for (var i = 0; i < $scope.tutorial.notes.length; i++) {
                    if ($scope.listOfContributors.indexOf($scope.tutorial.notes[i].contributor) == -1) {
                        if (!$scope.tutorial.notes[i].user_submitted || $scope.tutorial.notes[i].contributor === $scope.contributor.name) {
                            $scope.listOfContributors.push(($scope.tutorial.notes[i].contributor));
                        }
                    }
                }
                for (var g = 0; g < $scope.tutorial.steps.length; g++) {
                    for (var j = 0; j < $scope.tutorial.steps.length; j++) {
                        if ($scope.tutorial.steps[j].step_number == g) {
                            $scope.listOfSteps.push($scope.tutorial.steps[j]);
                            break;
                        }
                    }
                }

                $scope.itemArray = [];

                $scope.item = {};
                $scope.item.selected = [];

                for (var k = 0; k < $scope.listOfSteps.length; k++) {

                    if ($scope.listOfSteps[k].notes.length !== 0) {
                        var newItem = {};
                        newItem['id'] = k;
                        if (k == 0) {
                            newItem['name'] = "Intro";
                        } else if (k < $scope.listOfSteps.length - 2) {
                            newItem['name'] = k;
                        } else if (k === $scope.listOfSteps.length - 2) {
                            newItem['name'] = "End";
                        } else if (k === $scope.listOfSteps.length - 1) {
                            newItem['name'] = "General";
                        }
                        $scope.itemArray.push(newItem);
                    }
                }
                $scope.windowHeight = window.innerHeight - 88; // from stylesheet

                $scope.resetCurrent = function () {
                    $scope.currentStep.splice(0, $scope.currentStep.length);
                };

                $scope.lineClicked = function (index, $event, step) {

                    $scope.selectedLine = index;
                    $scope.inputPos = $event.pageY;
                    $scope.currentStep.push(step);
                    $scope.menuOpen = true;

                    LoggerService.log("Opened input dialog"
                        + " Tutorial - " + $scope.tutorial.title
                        + " Interface - Side Display");
                };

                $scope.chosenGeneral = function (step) {
                    if (!$scope.general || $scope.listOfSteps.indexOf(step) !== $scope.listOfSteps.length - 1) {
                        $scope.selectedStepsList.splice(0, $scope.selectedStepsList.length);

                        if (!$scope.general) {
                            $scope.selectedStepsList.push($scope.listOfSteps[$scope.listOfSteps.length - 1]);

                        }
                        $scope.general = !$scope.general;
                    }

                };

                $scope.findNoteInStep = function (step_number, note_id) {
                    for (var g = 0; g < $scope.tutorial.steps[step_number].notes.length; g++) {
                        if ($scope.tutorial.steps[step_number].notes[g].id === note_id) {
                            return parseInt(g);
                        }
                    }
                    return -1;
                };

                $scope.addNote = function (note) {
                    var firstNote = $scope.findNote(note.reply_to);
                    var stepNumber;
                    var stepIndex;
                    var mainIndex;
                    var mainNote;
                    var firstIndex;
                    var index;
                    var updatedNote;
                    var test;
                    var p1;

                    if ($scope.replyTo) {
                        if (firstNote.reply_to !== null && firstNote.reply_to.reply_to == null) {  //second level
                            mainIndex = $scope.findNoteIndex(firstNote.reply_to);
                            mainNote = $scope.findNote(firstNote.reply_to);
                            firstIndex = $scope.findReplyIndex(note.reply_to, mainNote);
                            $scope.tutorial.notes[mainIndex].replies[firstIndex].replies.push(note);
                            p1 = mainIndex;
                            updatedNote = $scope.tutorial.notes[mainIndex];
                            console.log($scope.tutorial.notes[mainIndex]);
                        }else if (firstNote.reply_to == null){    //first level
                             index = $scope.findNoteIndex(note.reply_to);
                             $scope.tutorial.notes[index].replies.push(note);
                            updatedNote = $scope.tutorial.notes[index].replies;
                        }
                    }

                    if (firstNote !== null && firstNote.reply_to == null) { //new note posted, first level of reply
                        for (var m = 0; m < note.step_id.length; m++) {
                            stepNumber = $scope.findStepNumber(note.step_id[m]);
                            stepIndex = $scope.findStepIndex(note.step_id[m]);
                            index = $scope.findNoteInStep(stepNumber, firstNote.id);
                            $scope.tutorial.steps[stepIndex].notes[index] = updatedNote;

                        }
                    } else if (firstNote === null) {//new note posted
                        for (var g = 0; g < note.step_id.length; g++) {
                            stepIndex = $scope.findStepIndex(note.step_id[g]);
                            $scope.tutorial.steps[stepIndex].notes.push(note);
                        }
                    } else if (firstNote !== null && firstNote.reply_to !== null) { //new note posted, second level of reply
                        for (var d = 0; d < note.step_id.length; d++) {
                            stepNumber = $scope.findStepNumber(note.step_id[d]);
                            stepIndex = $scope.findStepIndex(note.step_id[d]);
                            mainIndex = $scope.findNoteInStep(stepNumber, firstNote.reply_to);
                            mainNote = $scope.tutorial.steps[stepIndex].notes[mainIndex];
                            firstIndex = $scope.findReplyIndex(note.reply_to, mainNote);
                            $scope.tutorial.steps[stepIndex].notes[mainIndex].replies[firstIndex] = updatedNote;
                            test = $scope.tutorial.steps[stepIndex].notes[mainIndex];
                        }
                    }
                    $scope.tutorial.notes.push(note);
                    console.log(test);
                    $scope.testing(p1);
                    return p1;
                };

                $scope.testing = function(index){
                    console.log($scope.tutorial.notes[index]);
                };


                $scope.updateSteps = function (note) {
                    var firstNote = $scope.findNote(note.reply_to);
                    var mainIndex;
                    var mainNote;
                    var firstIndex;
                    var index;
                    var stepNumber;
                    var stepIndex;
                    if (firstNote !== null && firstNote.reply_to == null) { //new rating or deletion, first level of reply
                        stepNumber = $scope.findStepNumber(note.step_id[0]);
                        stepIndex = $scope.findStepIndex(note.step_id[0]);
                        firstNote = $scope.tutorial.steps[stepIndex].notes[$scope.findNoteInStep(stepNumber, firstNote.id)];
                        for (var k = 0; k < note.step_id.length; k++) {
                            stepNumber = $scope.findStepNumber(note.step_id[k]);
                            stepIndex = $scope.findStepIndex(note.step_id[k]);
                            index = $scope.findNoteInStep(stepNumber, firstNote.id);
                            var noteIndex = $scope.findReplyIndex(note.id, firstNote);
                            firstNote.replies[noteIndex] = note;
                            $scope.tutorial.steps[stepIndex].notes[index] = firstNote;
                        }
                    }else if (firstNote !== null && firstNote.reply_to !== null) { //new rating or deletion, second level of reply
                        console.log("second level");
                        for (var z = 0; z < note.step_id.length; z++) {
                            stepNumber = $scope.findStepNumber(note.step_id[z]);
                            stepIndex = $scope.findStepIndex(note.step_id[z]);
                            mainIndex = $scope.findNoteInStep(stepNumber, firstNote.reply_to);
                            mainNote = $scope.tutorial.steps[stepIndex].notes[mainIndex];
                            console.log($scope.tutorial.steps[stepIndex].notes[mainIndex]);
                            firstIndex = $scope.findReplyIndex(note.reply_to, mainNote);
                            var replyIndex = $scope.findReplyIndex(note.id, firstNote);
                            firstNote.replies[replyIndex] = note;
                            mainNote.replies[firstIndex] = firstNote;
                            $scope.tutorial.steps[stepIndex].notes[mainIndex] = mainNote;
                            console.log($scope.tutorial.steps[stepIndex].notes[mainIndex]);
                        }

                    } else if(firstNote == null ){ //new rating or deletion on a note
                        stepNumber = $scope.findStepNumber(note.step_id[0]);
                        stepIndex = $scope.findStepIndex(note.step_id[0]);
                        var oldNote = note;
                        note = $scope.tutorial.steps[stepIndex].notes[$scope.findNoteInStep(stepNumber, note.id)];
                        note.deleted = oldNote.deleted;
                        note.contributor_list = oldNote.contributor_list;
                        note.replies = oldNote.replies;
                        for (var i = 0; i < note.step_id.length; i++) {
                            stepNumber = $scope.findStepNumber(note.step_id[i]);
                            stepIndex = $scope.findStepIndex(note.step_id[i]);
                            index = $scope.findNoteInStep(stepNumber, note.id);
                            $scope.tutorial.steps[stepIndex].notes[index] = note;
                        }
                    }
                };

                $scope.updateTutorial = function (note) {
                    var firstNote = $scope.findNote(note.reply_to);
                    var mainIndex;
                    var mainNote;
                    var firstIndex;
                    var index;

                    if (firstNote !== null && firstNote.reply_to !== null) {

                        mainNote = $scope.findNote(firstNote.reply_to);
                        mainIndex = $scope.findNoteIndex(note.reply_to.reply_to);
                        firstIndex = $scope.findReplyIndex(note.reply_to, mainNote);
                        var replyIndex = $scope.findReplyIndex(note.id, firstNote);
                        firstNote.replies[replyIndex] = note;
                        mainNote.replies[firstIndex] = firstNote;
                        $scope.tutorial.notes[mainIndex] = mainNote;


                    } else if (firstNote !== null) {
                        index = $scope.findNoteIndex(firstNote.id);
                        var noteIndex = $scope.findReplyIndex(note.id, firstNote);
                        firstNote.replies[noteIndex] = note;
                        $scope.tutorial.notes[index] = firstNote;
                    }
                };


                $scope.updateDropdown = function () {
                    $scope.itemArray.splice(0, $scope.itemArray.length);
                    for (var k = 0; k < $scope.listOfSteps.length; k++) {

                        if ($scope.listOfSteps[k].notes.length !== 0) {
                            var newItem = {};
                            newItem['id'] = k;
                            if (k == 0) {
                                newItem['name'] = "Intro";
                            } else if (k < $scope.listOfSteps.length - 2) {
                                newItem['name'] = k;
                            } else if (k === $scope.listOfSteps.length - 2) {
                                newItem['name'] = "End";
                            } else if (k === $scope.listOfSteps.length - 1) {
                                newItem['name'] = "General";
                            }
                            $scope.itemArray.push(newItem);
                        }
                    }
                };

                $scope.addingReply = function ($index, $event, id, contributor, step) {

                    $scope.replyTo = id;
                    $scope.replyToContributor = contributor;
                    $scope.replyStep = step;
                    $scope.selectedStepsList = step.concat($scope.selectedStepsList);
                    $scope.lineClicked($index, $event, step);
                    LoggerService.log("Pressed Reply:"
                        + " Tutorial - " + $scope.tutorial.title
                        + " Interface - Side Display"
                        + " | Note - " + $scope.findNote(id).content.substr(0, 150));
                };

                $scope.getDropdownList = function () {
                    var list = [];

                    list.push({id: 0, name: "INTRO"});
                    for (var i = 1; i < $scope.listOfSteps.length - 2; i++) {
                        list.push({id: i, name: $scope.listOfSteps[i].step_number});
                    }
                    list.push({id: $scope.listOfSteps.length - 2, name: "END"});
                    list.push({id: $scope.listOfSteps.length - 1, name: "GENERAL"});
                    return list;
                };

                $scope.loggerMethod = function (step) {
                    LoggerService.log("Preview:"
                        + " Tutorial - " + $scope.tutorial.title
                        + " Interface - Side Display"
                        + " Step - " + step);

                };

                $scope.sortSelected = function () {
                    $scope.chosenSort = document.getElementById("sort").value.toString();
                    $scope.newSort();
                    LoggerService.log("Changed Sort:"
                        + " Tutorial - " + $scope.tutorial.title
                        + " Interface - Side Display"
                        + " Sort - " + $scope.chosenSort);
                };


                $scope.newSort = function () {
                    if ($scope.chosenSort === "new" || $scope.chosenSort === undefined || $scope.chosenSort === null || $scope.chosenSort === "old") {
                        $scope.orderDate($scope.listOfNotes);
                        if ($scope.chosenSort === "old") {
                            $scope.listOfNotes.reverse();
                        }
                    } else if ($scope.chosenSort == "high" || $scope.chosenSort == "low") {
                        $scope.orderRating($scope.listOfNotes);
                        if ($scope.chosenSort == "low") {
                            $scope.listOfNotes.reverse();
                        }
                    } else if ($scope.chosenSort == "category") {
                        var newList = ($scope.filterByCategory('corrections', $scope.listOfNotes.slice(0)));
                        newList = newList.concat($scope.filterByCategory('details', $scope.listOfNotes.slice(0)));
                        newList = newList.concat($scope.filterByCategory('questions', $scope.listOfNotes.slice(0)));
                        newList = newList.concat($scope.filterByCategory('other', $scope.listOfNotes.slice(0)));
                        $scope.listOfNotes = newList;
                    }
                };
                $scope.clear = function () {
                    $scope.testing($scope.temp);
                    console.log($scope.tutorial.steps[11].notes);
                    $scope.listOfNotes = ($scope.tutorial.notes.slice(0)).reverse();
                    $scope.newSort();
                    $scope.categoryFilter = null;
                    $scope.stepFilter.splice(0, $scope.stepFilter.length);
                    $scope.currentNote = null;
                    $scope.noteStepList.splice(0, $scope.noteStepList.length);
                    $scope.item.selected.splice(0, $scope.item.selected.length);

                    LoggerService.log("Pressed Clear:"
                        + " Tutorial - " + $scope.tutorial.title
                        + " Interface - Side Display");
                    return false;
                };

                $scope.newFilter = function (value) {
                    if (typeof value === 'string') {
                        if (value === $scope.categoryFilter) {
                            $scope.categoryFilter = null;
                        } else {
                            $scope.categoryFilter = value;
                        }
                    }
                    else if (value > -1) {
                        var index = $scope.stepFilter.indexOf(value);
                        if (index >= 0) {
                            $scope.stepFilter.splice(index, 1);
                        } else {
                            $scope.stepFilter.push(value);
                        }

                    }
                    if ($scope.categoryFilter !== null && $scope.stepFilter.length !== 0) {
                        $scope.getStepFilterNotes();
                        $scope.listOfNotes = $scope.filterByCategory($scope.categoryFilter, $scope.listOfNotes);
                    } else if ($scope.stepFilter.length !== 0) {
                        $scope.getStepFilterNotes();
                    } else if ($scope.categoryFilter !== null) {
                        $scope.listOfNotes = $scope.filterByCategory($scope.categoryFilter, ($scope.tutorial.notes.slice(0)));
                    } else if ($scope.stepFilter.length < 1 || $scope.categoryFilter == null) {
                        $scope.listOfNotes = ($scope.tutorial.notes.slice(0));
                    }
                    $scope.newSort();
                    LoggerService.log("Changed Filter:"
                        + " Tutorial - " + $scope.tutorial.title
                        + " Interface - Side Display"
                        + " Category - " + $scope.categoryFilter
                        + " Step - " + $scope.stepFilter.toString());
                };

                $scope.sideIcon = function (step, category) {
                    if ($scope.categoryFilter == category && $scope.stepFilter[0] == parseInt(step.step_number)) {
                        LoggerService.log("Turned off Filter by Icon:"
                            + " Tutorial - " + $scope.tutorial.title
                            + " Interface - Side Display"
                            + " Category - " + $scope.categoryFilter
                            + " Step - " + $scope.stepFilter.toString());

                        $scope.categoryFilter = null;
                        $scope.stepFilter.splice(0, $scope.stepFilter.length);
                        $scope.item.selected.splice(0, $scope.item.selected.length);
                        $scope.listOfNotes = ($scope.tutorial.notes.slice(0)).reverse();
                        $scope.newSort();
                    } else {
                        $scope.categoryFilter = null;
                        $scope.stepFilter.splice(0, $scope.stepFilter.length);
                        $scope.item.selected.splice(0, $scope.item.selected.length);

                        LoggerService.log("Filter by Icon");

                        $scope.newFilter(parseInt(step.step_number));
                        $scope.newFilter(category);
                        $scope.item.selected.push($scope.returnStep(step.step_number));

                    }

                };

                $scope.returnStep = function (id) {
                    var result = $.grep($scope.itemArray, function (e) {
                        return e.id == id;
                    });
                    return result[0];
                };

                $scope.getStepFilterNotes = function () {
                    $scope.listOfNotes.splice(0, $scope.listOfNotes.length);
                    for (var i = 0; i < $scope.stepFilter.length; i++) {
                        var stepList = [];
                        for (var k = 0; k < $scope.listOfSteps[$scope.stepFilter[i]].notes.length; k++) {
                            var note = $scope.listOfSteps[$scope.stepFilter[i]].notes[k];
                            if (!$scope.checkForNote($scope.listOfNotes, note)) {
                                stepList.push(note);
                            }
                        }
                        $scope.listOfNotes = $scope.listOfNotes.concat(stepList);
                    }
                };


                $scope.filterByCategory = function (category, list) {
                    var tempList = [];
                    for (var i = 0; i < list.length; i++) {
                        if (list[i].category == category) {
                            tempList.push(list[i]);
                        }
                    }
                    return (tempList.slice(0));

                };

                $scope.getNoteList = function (note) {
                    $scope.stepList.splice(0, $scope.stepList.length);
                    var stringList = "";
                    for (var i = 0; i < note.step_id.length; i++) {
                        var num = $scope.findStepNumber(note.step_id[i]);
                        if (num == 0) {
                            num = "INTRO";
                        } else if (num == $scope.listOfSteps.length - 2) {
                            num = "END";
                        }
                        $scope.stepList.push(num);
                    }
                    if ($scope.stepList.length <= 3) {
                        stringList = $scope.stepList.toString();
                    } else {
                        stringList = $scope.stepList.slice(0, 3).toString() + "+";
                    }

                    return stringList;
                };

                $scope.findStepNumber = function (stepID) {
                    for (var j = 0; j < $scope.listOfSteps.length; j++) {
                        if ($scope.listOfSteps[j].id === stepID) {
                            return $scope.listOfSteps[j].step_number;
                        }
                    }
                    return null;
                };

                $scope.categorySelected = function (category) {
                    $scope.showTextarea = true;
                    $scope.inputCategory = category;
                    $scope.extraInput = "";

                    LoggerService.log("Changed input to category: " + category
                        + " Tutorial - " + $scope.tutorial.title
                        + " Interface - Side Display");
                };

                $scope.stepAdded = function (step) {

                    if ($scope.general) {
                        $scope.chosenGeneral(step);
                    }
                    $scope.selectedStepsList.push(step);

                };

                $scope.stepRemoved = function (step, index) {
                    $scope.selectedStepsList.splice(index, 1);
                    if ($scope.selectedStepsList.length == 0) {
                        $scope.chosenGeneral(step);
                    }
                };

                $scope.stepSelected = function (step) {
                    var index = $scope.selectedStepsList.indexOf(step);
                    if (index == -1) {
                        $scope.stepAdded(step)
                    } else {
                        $scope.stepRemoved(step, index);
                    }
                };

                $scope.numberList = function () {
                    $scope.list = [];
                    for (var i = 0; i < $scope.selectedStepsList.length; i++) {
                        if ($scope.selectedStepsList[i].step_number > 0 && $scope.selectedStepsList[i].step_number < ($scope.listOfSteps.length - 2)) {
                            $scope.list.push($scope.selectedStepsList[i].step_number);
                        } else if ($scope.selectedStepsList[i].step_number == $scope.listOfSteps.length - 2) {
                            $scope.list.push("END");
                        } else if ($scope.selectedStepsList[i].step_number == $scope.listOfSteps.length - 1) {
                            $scope.list.push("GENERAL");
                        } else {
                            $scope.list.push("INTRO");
                        }
                    }
                };

                $scope.closeInput = function () {
                    $scope.showTextarea = false;
                    $scope.inputCategory = "";
                    $scope.newNote = "";
                    $scope.extraInput = "";
                    $scope.selectedLine = null;
                    $scope.inputPos = null;
                    $scope.replyTo = null;
                    $scope.replyToContributor = "";
                    $scope.selectedStepsList.splice(0, $scope.selectedStepsList.length);
                    $scope.stepAdd = false;
                    $scope.secondMenu = false;
                    $scope.menuOpen = false;
                    $scope.resetCurrent();
                    LoggerService.log("Closed input dialog:"
                        + " Tutorial - " + $scope.tutorial.title
                        + " Interface - Side Display");
                };

                $scope.submitNote = function () {

                    if ($scope.replyTo !== null && $scope.newNote) {

                        $scope.selectedLine = null;
                        $scope.inputCategory = "reply";
                        $scope.extraInput = "";
                    }

                    if (($scope.selectedStepsList !== null || $scope.replyTo !== null) && $scope.newNote) {
                        var note = {
                            "step_id": $scope.selectedStepsList,
                            "tutorial_id": $scope.tutorial.id,
                            "category": $scope.inputCategory,
                            "extra_info": $scope.extraInput,
                            "content": $scope.newNote,
                            "contributor": $scope.contributor.name,
                            "reply_to": $scope.replyTo
                        };


                        if (!$scope.replyTo) {
                            note.step_id = $scope.findStepId($scope.selectedStepsList);
                        }

                        var returnedNote = TutorialService.post(note).then(function (result) {
                            $scope.newNote = result;
                            $scope.newNote.replies = [];
                            $scope.temp = $scope.addNote($scope.newNote);
                            if (!$scope.replyTo) {
                                $scope.updateDropdown();
                            }
                            $scope.newFilter(-1);
                            $scope.newSort();
                            $scope.closeInput();

                            LoggerService.log("Submitted a note:"
                                + " Tutorial - " + $scope.tutorial.title
                                + " Interface - Side Display"
                                + " | Step - " + $scope.selectedLine
                                + " | Category - " + $scope.inputCategory
                                + " | Extra Input - " + $scope.extraInput
                                + " | Note - " + $scope.newNote);
                        });
                    }
                };

                $scope.checkForNote = function (list, note) {
                    for (var i = 0; i < list.length; i++) {
                        if (list[i].id == note.id) {
                            return true;
                        }
                    }
                    return false;
                };

                $scope.findStepIndex = function (id) {
                    for (var g = 0; g < $scope.tutorial.steps.length; g++) {
                        if ($scope.tutorial.steps[g].id === id) {
                            return parseInt(g);
                        }
                    }
                    return -1;
                };

                $scope.findNoteIndex = function (note) {
                    for (var g = 0; g < $scope.tutorial.notes.length; g++) {
                        if ($scope.tutorial.notes[g].id === note) {
                            return parseInt(g);
                        }
                    }
                    return -1;
                };

                $scope.findReplyIndex = function (reply, parent) {
                    for (var g = 0; g < parent.replies.length; g++) {
                        if (parent.replies[g].id === reply) {
                            return parseInt(g);
                        }
                    }
                    return -1;
                };


                $scope.findStepId = function (list) {
                    var idList = [];
                    for (var i = 0; i < $scope.selectedStepsList.length; i++) {
                        for (var j = 0; j < $scope.listOfSteps.length; j++) {
                            if ($scope.listOfSteps[j].step_number === $scope.selectedStepsList[i].step_number) {
                                idList.push($scope.listOfSteps[j].id);
                                break;
                            }
                        }
                    }
                    return idList;
                };

                $scope.deleteNote = function (note_id) {
                    $scope.deleteChange = true;
                    var note = $scope.findNote(note_id);
                    TutorialService.put(note, $scope.deleteChange, $scope.ratingChange);
                    $scope.updateSteps(note);
                    $scope.updateTutorial(note);

                    $scope.deleteChange = false;

                    LoggerService.log("Deleted a note:"
                        + " Tutorial - " + $scope.tutorial.title
                        + "Interface - Side Display"
                        + " | Step - " + $scope.selectedLine
                        + " | Category - " + $scope.inputCategory
                        + " | Extra Input - " + $scope.extraInput
                        + " | Note - " + $scope.newNote);

                };

                $scope.findNote = function (note_id) {
                    for (var i = 0; i < $scope.tutorial.notes.length; i++) {
                        if ($scope.tutorial.notes[i].id === note_id) {
                            return $scope.tutorial.notes[i];
                        }
                    }
                    return null;
                };

                $scope.checkForCategory = function (step, category) {

                    var hasCategory = false;

                    for (var i = 0; !hasCategory && i < step.notes.length; i++) {
                        if ($scope.canShowNote(step.notes[i]) && step.notes[i].category === category) {
                            hasCategory = true;
                        }
                    }

                    return hasCategory;
                };

                $scope.canShowNote = function (note) {

                    var canShow = false;

                    if ((!note.user_submitted || note.contributor === $scope.contributor.name) && !note.deleted) {

                        canShow = true;
                    }

                    return canShow;
                };


                $scope.newRating = function (note_id) {
                    $scope.testing($scope.temp);
                    $scope.ratingChange = true;
                    var note = $scope.findNote(note_id);
                    console.log(note);
                    console.log($scope.findNote(note.reply_to));
                    console.log($scope.findNoteInStep(11,note.reply_to));
                    console.log($scope.tutorial.steps[11].notes[$scope.findNoteInStep(11,note.reply_to)]);
                    TutorialService.put(note, $scope.deleteChange, $scope.ratingChange);
                    //$scope.updateSteps(note);
                    $scope.updateTutorial(note);

                    $scope.ratingChange = false;
                };

                $scope.numberOfNotes = function (step, category) {
                    var numNotes = 0;
                    for (var i = 0; i < step.notes.length; i++) {
                        if ($scope.canShowNote(step.notes[i]) && step.notes[i].category === category) {
                            numNotes++;
                        }
                    }
                    return numNotes;
                };

                $scope.showCategory = function (show, category, step) {

                    LoggerService.log("Toggled category: "
                        + " Tutorial - " + $scope.tutorial.title
                        + "Interface - Side Display"
                        + " | Category - " + category
                        + " | Visibility - " + !show
                        + " | Step - " + step.html.substr(0, 50) + "...");

                    return !show;
                };

                $scope.showStepList = function (note) {
                    if ($scope.currentNote == null || note !== $scope.currentNote) {
                        $scope.noteStepList = (note.step_id.slice(0));
                        $scope.currentNote = note;
                    } else {
                        $scope.noteStepList.splice(0, $scope.noteStepList.length);
                        $scope.currentNote = null;
                    }
                };


                $scope.showContributors = function (show) {
                    LoggerService.log("Toggled contributor list: "
                        + " Tutorial - " + $scope.tutorial.title
                        + "Interface - Side Display"
                        + " | Visibility - " + !show);

                    return !show;
                };

                $scope.menuSwitch = function () {
                    $scope.secondMenu = !$scope.secondMenu;
                };

                $scope.dateFormat = function (note) {
                    return moment(note.dateSubmitted).format("YYYY-MM-DD");
                };

                $scope.orderDate = function (list) {
                    var tempNote1;
                    var tempNote2;
                    var index;
                    for (var j = 0; j < list.length; j++) {
                        tempNote1 = list[j];
                        for (var k = j; k < list.length; k++) {
                            if (moment(list[k].dateSubmitted).isAfter(moment(tempNote1.dateSubmitted))) {
                                tempNote1 = list[k];
                                index = k;
                            }
                        }
                        if (tempNote1 != list[j]) {
                            tempNote2 = list[j];
                            list[j] = tempNote1;
                            list[index] = tempNote2;
                        }
                    }
                };

                $scope.chosenSort = "new";
                $scope.newSort();

                $scope.orderRating = function (list) {
                    var tempNote1;
                    var tempNote2;
                    var index;
                    for (var j = 0; j < list.length; j++) {
                        tempNote1 = list[j];
                        for (var k = j; k < list.length; k++) {
                            if (parseInt(list[k].contributor_list.length) > parseInt(tempNote1.contributor_list.length)) {
                                tempNote1 = list[k];
                                index = k;
                            }
                        }
                        if (tempNote1 != list[j]) {
                            tempNote2 = list[j];
                            list[j] = tempNote1;
                            list[index] = tempNote2;
                        }
                    }
                }
            });
    });

angular.module('AnnotatedTutorial')
    .directive('note', function(RecursionHelper) {
        'use strict';

        return {
            restrict: 'E',
            templateUrl: 'note.html',
            scope: {note: '=',deleteIt: '=',rateIt:"=", addReply: '=', canShowNote: '=',showList: '=', user: '=', general:'=', date: '=',currentNote:'=', notelist:'=', currentReply: '=',replyOne: '='},
            compile: function(element) {
                return RecursionHelper.compile(element, function(scope, iElement, iAttrs, controller, transcludeFn){});
            }
        };
    });