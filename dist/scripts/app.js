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
        var pseudonym = 'Panda'//'Assiniboine';//localStorage.getItem('pseudonym');

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
    this.replies = [];
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
                console.log(note.contributor_list);
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
                            if($scope.replyTo){
                                $scope.tutorial.notes[$scope.findNoteIndex($scope.newNote.reply_to)].replies.push($scope.newNote);
                            }

                            $scope.tutorial.notes.push($scope.newNote);

                            $scope.listOfNotes = ($scope.tutorial.notes.slice(0));
                            $scope.newSort();
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

                $scope.findReplyIndex=function(reply, parentIndex){
                    for(var g=0; g<$scope.tutorial.notes[parentIndex].replies.length; g++){
                        if($scope.tutorial.notes[parentIndex].replies[g].id===reply){
                            return parseInt(g);
                        }
                    }
                    return -1;
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
                    if(note.reply_to !== null){
                        var index = $scope.findNoteIndex (mainNote.id);
                        var replyIndex = $scope.findReplyIndex(note.id,index);
                        mainNote.replies[replyIndex] = note;
                        $scope.tutorial.notes[index] = mainNote;
                    }

                    $scope.ratingChange = false;

                    /*if(note.reply_to !== null){
                        var index = $scope.findNoteIndex(note.reply_to);
                        $scope
                    }*/

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
angular.module('AnnotatedTutorial')
    .directive('note', function(RecursionHelper) {
        'use strict';

        return {
            restrict: 'E',
            templateUrl: 'note.html',
            scope: {note: '=',deleteIt: '=',rateIt:"=", addReply: '=', canShowNote: '=', user: '=', date: '=', currentReply: '=', hasReply:'='},
            compile: function(element) {
                return RecursionHelper.compile(element, function(scope, iElement, iAttrs, controller, transcludeFn){});
            }
        };
    });