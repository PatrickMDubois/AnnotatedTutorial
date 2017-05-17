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