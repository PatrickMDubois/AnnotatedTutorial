angular.module('AnnotatedTutorial')
    .directive('note', function(RecursionHelper) {
        'use strict'

        return {
            restrict: 'E',
            templateUrl: 'note.html',
            scope: {note: '='},
            compile: function(element) {
                return RecursionHelper.compile(element, function(scope, iElement, iAttrs, controller, transcludeFn){});
            }
        };
    });