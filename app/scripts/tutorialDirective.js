angular.module('BranchedTutorial')
    .directive('tutorial', function(RecursionHelper) {
        'use strict';

        return {
            restrict: 'E',
            templateUrl: 'tutorial.html',
            scope: {
                tutorial: '='
            },
            controller: function($scope) {
                // ...
            },
            compile: function(element) {
                return RecursionHelper.compile(element, function(scope, iElement, iAttrs, controller, transcludeFn){

                });
            }
        }
    });