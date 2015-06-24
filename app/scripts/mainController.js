angular.module('BranchedTutorial')
    .controller('mainController', function($scope, TutorialService){
        'use strict';

        TutorialService.loaded
            .then(function() {
                $scope.tutorial = TutorialService.tutorial;
                $scope.selectedVersion = 'original';
            });
    });