(function($angular, $moment, _) {
    'use strict';

    $angular.module('app')
    .controller('mainController', ['$scope', '$timeout', 'StorageService', 'UtilityService', function($scope, $timeout, storage, utils){
        $scope.diameter = 65;
        $scope.unit = 'vmin';
        $scope.time = $moment();
        $scope.time2 = $moment();
    }]);

})(window.angular, window.moment, window._);
