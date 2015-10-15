(function($angular) {
    'use strict';

    $angular.module('app')
    .constant('system', {
        name: 'pocky',
        prefix: 'pocky:',
        version: 0.1,
        dateFormat: 'ddd, MMM D',
        dayFormat: 'dd',
        timeFormat: 'h:mm a'
    })
    .config(function($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/');

        $stateProvider
        .state('main', {
            url: '/',
            templateUrl : 'views/main.html',
            controller  : 'mainController'
        });
    })
    .config(function($provide) {
        // to use: call $state.forceReload();
        $provide.decorator('$state', function($delegate, $stateParams) {
            $delegate.forceReload = function() {
                return $delegate.go($delegate.current, $stateParams, {
                    reload: true,
                    inherit: false,
                    notify: true
                });
            };
            return $delegate;
        });
    });

})(window.angular);
