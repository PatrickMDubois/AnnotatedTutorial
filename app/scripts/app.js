(function(w) {
    'use strict';

    w.app = angular.module('AnnotatedTutorial', ['app-templates', 'ngSanitize', 'angularMoment', 'RecursionHelper']);

    app.factory('annotatedTutorialServer', function() {
        if (typeof(DEVELOPMENT) === 'undefined') {
            return '//dorado.cs.umanitoba.ca:8000'; // production environment
        } else {
            return 'http://127.0.0.1:8000'; // development environment
        }
    });

    app.factory('currentParticipant', function() {
        var pseudonym = ''//'Assiniboine';//localStorage.getItem('pseudonym');

        if (!pseudonym) {
            while (!pseudonym) {
                pseudonym = prompt('Please, enter your pseudonym');
            }

            localStorage.setItem('pseudonym', pseudonym);
          }

        return pseudonym;
    });

})(window);