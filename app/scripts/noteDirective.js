angular.module('AnnotatedTutorial')
    .directive('note', function() {
        'use strict'

        return {
            restrict: 'E',
            templateUrl: 'note.html',
            scope: {tutorial: '='},
            controller: function($scope) {/* ...*/},
            compile: function(element) {{/* ...*/}}
        };
    });