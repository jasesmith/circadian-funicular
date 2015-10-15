(function($angular, $moment, _){
    'use strict';

    $angular.module('app')
    .factory('AccountService', ['$rootScope', 'system', 'StorageService', 'UtilityService', function($rootScope, system, storage, utils){

        var _defaultPreferences = {
        };

        var getPreferences = function(){
            var preferences = storage.get(system.prefix + 'preferences');
            if(_.isNull(preferences)) {
                preferences = $angular.copy(_defaultPreferences);
                storage.save(system.prefix + 'preferences', preferences);
            }
            return preferences;
        };

        var updatePreference = function(key, value){
            var preferences = getPreferences();
            preferences[key] = value;
            // window.console.log(key, value);
            storage.save(system.prefix + 'preferences', preferences);
            return preferences;
        };

        var updatePreferences = function(keys, values){
            var preferences = getPreferences();
            _.each(keys, function(key, index){
                preferences[key] = values[index];
            });
            storage.save(system.prefix + 'preferences', preferences);
            return preferences;
        };

        return {
            getPreferences: getPreferences,
            updatePreference: updatePreference,
            updatePreferences: updatePreferences
        };

    }]);

})(window.angular, window.moment, window._);
