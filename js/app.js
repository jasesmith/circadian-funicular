(function($angular) {
    'use strict';

    $angular.module('app', [
        'jamfu',
        'ui.router',
        'hmTouchEvents'
    ])
    .controller('appController', [
        '$scope', '$state', '$location', '$timeout', 'system', 'AccountService', 'StorageService', 'UtilityService', function(
        $scope, $state, $location, $timeout, system, account, storage, utils
        ){

        $scope.viewIsLoading = false;

        $scope.headline = 'Circadian Funicular';
        $scope.icon = 'clock-o';

        $scope.init = function(){
            $scope.view = $state.current.name;
            $scope.preferences = account.getPreferences();
        };

        $scope.init();

        $scope.$watch('preferences', function(n, o){
            if(n && o && n !== o) {
                // window.console.log('watch prefs', n);
                storage.save(system.prefix + 'preferences', n);
                $scope.preferences = n;
            }
        }, true);

        $scope.$watch(function(){
            return $state.current.name;
        }, function(value){
            $scope.view = value;
        }, true);

    }]);

})(window.angular);
