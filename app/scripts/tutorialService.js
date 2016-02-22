angular.module('AnnotatedTutorial')
    .factory('TutorialService', function($http, annotatedTutorialServer){
        'use strict';

        var tutorials = [],
            idIndexMap = {},
            promise;

        //promise = $http.get('http://127.0.0.1:8000/tutorials/tutorials/1')
        promise = $http.get(annotatedTutorialServer + '/tutorials/tutorials')
            .then(function(response) {
                tutorials = response.data;

                idIndexMap = {};

                angular.forEach(response.data, function(tutorial, index) {
                    idIndexMap[tutorial.id] = index;
                });
            });

        return {
            loaded: promise,
            tutorials: tutorials,
            get: function(id) {
                return tutorials[idIndexMap[id]];
            }
        };
    });