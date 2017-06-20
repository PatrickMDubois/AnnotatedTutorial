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