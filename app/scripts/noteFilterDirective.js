angular.module('AnnotatedTutorial',['ngSanitize', 'ui.select'])
    .directive('noteFilter', function (){
        'use strict';

        /*$scope.itemArray = [
            {id: 1, name: 'first'},
            {id: 2, name: 'second'},
            {id: 3, name: 'third'},
            {id: 4, name: 'fourth'},
            {id: 5, name: 'fifth'}
        ];

        $scope.selectedItem = $scope.itemArray[0];*/

        return {
            restrict: 'E',
            templateUrl: 'note-filter.html',
            scope: {list: '='}
        };
    });