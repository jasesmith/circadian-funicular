(function($angular, $moment, _) {
    'use strict';

    $angular.module('app')
    .controller('mainController', ['$scope', '$timeout', 'StorageService', 'UtilityService', function($scope, $timeout, storage, utils){
        $scope.diameter = 50;
        $scope.unit = 'vmin';
        // $scope.mode = 'set';
        $scope.xRay = false;
        $scope.time = $moment();

        $scope.format = function(datetime){
            return new Date(datetime);
        };

        $scope.reset = function(){
            $scope.diameter = 50;
            $scope.unit = 'vmin';
            // $scope.xRay = false;
            $scope.time = $moment();
        };

        $scope.toggleMode = function(){
          if($scope.mode === 'tell') {
            $scope.mode = 'set';
          }
          else if($scope.mode === 'set') {
            $scope.time = $moment();
            $scope.mode = 'tell';
          }
        };

    }]);

})(window.angular, window.moment, window._);
