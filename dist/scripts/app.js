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
        var pseudonym = ''//'Assiniboine';//localStorage.getItem('pseudonym');

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
                var note = new Note({
                    step_id: note.step_id,
                    tutorial_id: note.tutorial_id,
                    category: note.category,
                    extra_info: note.extra_info,
                    content: note.content,
                    contributor: note.contributor,
                    user_submitted: true,
                    reply_to: note.reply_to,
                    deleted:false,
                    rating:0,
                });

                $http.post(annotatedTutorialServer + '/tutorials/notes', note);
            },
            put: function(note,deleteChange, ratingChange){

                if(deleteChange == true) {
                    note.deleted = true;
                }else if(ratingChange == true){
                    note.rating = parseInt(note.rating)+1;
                    console.log(ratingChange);

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
                $scope.currentStep=[];
                $scope.highRating = null;
                $scope.selectedStepsList = [];
                $scope.secondMenu = false;
                $scope.ratingChange = false;
                $scope.deleteChange = false;

                $scope.noteStepList=[];
                $scope.currentNote=null;
                $scope.stepFilter = null;
                $scope.categoryFilter = null;
                $scope.general = false;

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

                $scope.windowHeight = window.innerHeight - 88; // from stylesheet

                $scope.resetCurrent=function(){
                    $scope.currentStep.splice(0,$scope.currentStep.length);
                };

                $scope.lineClicked = function(index, $event,step){

                    $scope.selectedLine = index;
                    $scope.inputPos = $event.pageY;
                    $scope.currentStep.push(step);

                    LoggerService.log("Opened input dialog");
                };

<<<<<<< HEAD
                $scope.test = function(){
                  console.log("raquel");
=======
                $scope.chosenWholeTutorial = function(){
                    if(!$scope.wholeTutorial) {
                        $scope.selectedStepsList.splice(0, $scope.selectedStepsList.length);
                    }
                    $scope.wholeTutorial = !$scope.wholeTutorial;
                    for(var i = 0; i <$scope.listOfSteps.length-1; i++){
                        var stepID = "step " + i;
                        document.getElementById(stepID).disabled = $scope.wholeTutorial;
                    }
>>>>>>> 9abccc42c198cc3301eac0b430b8f5e82892ec4e
                };

                $scope.addingReply = function($index, $event, id, contributor, step){

                    $scope.replyTo =id;
                    $scope.replyToContributor = contributor;

                    if($scope.tutorial.baseline){

                        $scope.categorySelected("other");
                    }
                    else{

                        $scope.replyStep = step;
                    }
                    $scope.selectedStepsList = step.concat($scope.selectedStepsList);
                    $scope.lineClicked($index,$event,step);
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
                      newList = newList.concat($scope.filterByCategory('methods',$scope.listOfNotes.slice(0)));
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
                  $scope.stepFilter = null;
                  $scope.currentNote = null;
                  $scope.noteStepList.splice(0,$scope.noteStepList.length);
                  document.getElementById("filter").value = "none";
                };

                $scope.newFilter = function(value){
                    if(value === undefined){
                        $scope.stepFilter = chosenFilter;
                    }else if(typeof value === 'string') {
                        $scope.categoryFilter = value;
                    }else{
                        $scope.stepFilter = value;
                    }
                    if($scope.categoryFilter!== null && $scope.stepFilter !== null){
                        $scope.listOfNotes=(($scope.tutorial.steps[$scope.stepFilter].notes).slice(0));
                        $scope.listOfNotes = $scope.filterByCategory($scope.categoryFilter,$scope.listOfNotes);
                    }else if($scope.stepFilter !== null){
                       $scope.listOfNotes=(($scope.tutorial.steps[$scope.stepFilter].notes).slice(0));
                    }else if($scope.categoryFilter!== null){
                        $scope.listOfNotes = $scope.filterByCategory($scope.categoryFilter,($scope.tutorial.notes.slice(0)));
                    }
                    $scope.newSort();
                };

                $scope.stepIcon = function(step){
                    $scope.newFilter(parseInt(step));
                    document.getElementById("filter").value = parseInt(step);
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

                $scope.categorySelected = function(category){
                    $scope.showTextarea = true;
                    $scope.inputCategory = category;
                    $scope.extraInput = "";

                    LoggerService.log("Changed input to category: " + category);
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
                            $scope.list.push("WHOLE TUTORIAL");
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

                    LoggerService.log("Closed input dialog");
                };

                $scope.submitNote = function(){

                    if(($scope.tutorial.baseline || $scope.replyTo!==null) && $scope.newNote){

                        $scope.selectedLine = null;
                        $scope.inputCategory = "comment";
                        $scope.extraInput = "";
                    }
                    if(($scope.tutorial.baseline || $scope.selectedStepsList!==null||$scope.replyTo!==null) && $scope.newNote){
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
                        }

                        TutorialService.post(note);

                        $scope.tutorial.notes.push(note);

                        note.step_id = $scope.selectedStepsList.slice(0);
                        note.dateSubmitted=moment().format("MMM Do YY");

                        if($scope.replyTo){
                            $scope.tutorial.notes[$scope.findNoteIndex(note.reply_to)].replies.push(note);
                        }

                        if(!$scope.replyTo){
                            for(var index=0; index<note.step_id.length; index++){
                                $scope.tutorial.steps[$scope.findStepIndex(note.step_id[index].id)].notes.push(note);
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
                    TutorialService.put($scope.findNote(note_id),$scope.deleteChange, $scope.ratingChange);

                    $scope.deleteChange = false;

                    LoggerService.log("Deleted a note:"
                        + " Tutorial - " + $scope.tutorial.titlenp
                        + " | Step - " + $scope.selectedLine
                        + " | Category - " + $scope.inputCategory
                        + " | Extra Input - " + $scope.extraInput
                        + " | Note - " + $scope.newNote);

                };

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


                $scope.orderRating = function(list){
                    var tempNote1;
                    var tempNote2;
                    var index;
                    for(var j = 0; j < list.length; j++){
                        tempNote1 = list[j];
                        for(var k=j; k<list.length; k++){
                            if(list[k].rating>tempNote1.rating){
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
angular.module('AnnotatedTutorial')
    .directive('note', function(RecursionHelper) {
        'use strict';

        return {
            restrict: 'E',
            templateUrl: 'note.html',
            scope: {note: '=',deleteIt: '=',rateIt:"=", addReply: '=', canShowNote: '=', baseline: '=', showList: '=', user: '=', general:'=', date: '='},
            compile: function(element) {
                return RecursionHelper.compile(element, function(scope, iElement, iAttrs, controller, transcludeFn){});
            }
        };
    });