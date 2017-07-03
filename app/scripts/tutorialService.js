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
                    rating:0
                });

                $http.post(annotatedTutorialServer + '/tutorials/notes', note);
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