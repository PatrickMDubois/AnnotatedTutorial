angular.module('BranchedTutorial')
    .factory('TutorialService', function($http){
        'use strict';

        var tutorial = {},
            promise;

        promise = $http.get('/data/stubdata.json')
            .then(function(response) {
                for (var property in response.data) {
                    if (response.data.hasOwnProperty(property)) {
                        tutorial[property] = response.data[property];
                    }
                }
            });

        return {
            loaded: promise,
            tutorial: tutorial
        };
    });