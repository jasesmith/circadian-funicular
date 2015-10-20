(function($angular, $moment, _) {
    'use strict';

    $angular.module('app')
    .controller('mainController', ['$scope', '$timeout', 'StorageService', 'UtilityService', function($scope, $timeout, storage, utils){
        $scope.diameter = 50;
        $scope.unit = 'vmin';
        // $scope.mode = 'set';
        // $scope.xRay = true;
        $scope.time = $moment();
        $scope.time2 = $moment();

        $scope.format = function(datetime){
              return new Date(datetime);
        };

    }]);

})(window.angular, window.moment, window._);
