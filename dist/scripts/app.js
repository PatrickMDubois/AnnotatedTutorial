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
    this.author = data.author;
    this.user_submitted = data.user_submitted;
    this.reply_to = data.reply_to;
    this.type = data.type;
}

angular.module('AnnotatedTutorial')
    .factory('TutorialService', function($http, annotatedTutorialServer, currentParticipant){
        'use strict';

        var author = null;

        var promise = $http.get(annotatedTutorialServer + '/tutorials/author/' + currentParticipant)
            .then(function(response) {

                author = response.data;
            });

        return {
            loaded: promise,
            get: function() {
                return author;
            },
            post: function(note) {
                var note = new Note({
                    step_id: note.step_id,
                    tutorial_id: note.tutorial_id,
                    category: note.category,
                    extra_info: note.extra_info,
                    content: note.content,
                    author: note.author,
                    user_submitted: true,
                    reply_to: note.reply_to,
                    type:note.type
                });

                $http.post(annotatedTutorialServer + '/tutorials/notes', note);
            }
        };
    });
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
                for(var i = 0; i < $scope.tutorial.notes.length; i++) {
                    if($scope.listOfAuthors.indexOf($scope.tutorial.notes[i].author) == -1) {
                        if(!$scope.tutorial.notes[i].user_submitted || $scope.tutorial.notes[i].author === $scope.author.name) {
                            $scope.listOfAuthors.push(($scope.tutorial.notes[i].author));
                        }
                    }
                }
                $scope.listOfSteps = [];
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

                $scope.lineClicked = function($index, $event){

                    $scope.selectedLine = $index;
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

                        $scope.selectedLine = step;
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

                /*$scope.stepSelected = function(step){
                    var temp = document.getElementById(step.toString())
                    var temp2 = temp.options[temp.selectedIndex.value];
                    $scope.stepNumber = temp2;
                }*/

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

                    if(($scope.tutorial.baseline || $scope.selectedLine> -1) && $scope.newNote){
                        var note = {
                            "step_id": $scope.selectedLine,
                            "tutorial_id": $scope.tutorial.id,
                            "category": $scope.inputCategory,
                            "extra_info": $scope.extraInput,
                            "content": $scope.newNote,
                            "author": $scope.author.name,
                            "reply_to": $scope.replyTo,
                            "type":$scope.inputType
                        };

                        if(!$scope.replyTo){
                            note.step_id += $scope.tutorial.steps[0].id;
                        }

                        TutorialService.post(note);
                        $scope.tutorial.notes.push(note);

                        note.step_id = $scope.selectedLine;

                        if($scope.replyTo){
                            note.step_id -= $scope.tutorial.steps[0].id;
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

                $scope.deleteNote = function(stepIndex,id,step){
                    $scope.noteNum=id;
                    if(!$scope.tutorial.baseline) {
                        var index = $scope.tutorial.step.indexOf(id);
                        if(index!= -1) {
                            $scope.tutorial.step.notes.splice(index,1);
                        }
                    }
                    console.log($scope.noteNum);
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

                  if(!note.user_submitted || note.author === $scope.author.name){

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
angular.module('AnnotatedTutorial')
    .directive('note', function(RecursionHelper) {
        'use strict'

        return {
            restrict: 'E',
            templateUrl: 'note.html',
            scope: {note: '=', addReply: '=', canShowNote: '=', baseline: '='},
            compile: function(element) {
                return RecursionHelper.compile(element, function(scope, iElement, iAttrs, controller, transcludeFn){});
            }
        };
    });