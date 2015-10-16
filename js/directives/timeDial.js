(function($angular, $moment){
	'use strict';

	$angular.module('app')
	.directive('timeDial', [function() {

        var _getNumbers = function(target){
            var numbers = {};
            if(target) {
                numbers = {
                    t: target.offsetTop,
                    r: target.offsetLeft + target.offsetWidth,
                    b: target.offsetTop + target.offsetHeight,
                    l: target.offsetLeft,
                    w: target.offsetWidth,
                    h: target.offsetHeight,
                };
                // find x|y center
                numbers.cx = (numbers.l + (numbers.w/2));
                numbers.cy = (numbers.t + (numbers.h/2));
            }
            return numbers;
        };

        var _getDeg = function(mouse, b){
            var barrel = _getNumbers(b);
            var radians = Math.atan2((mouse.clientY - barrel.cy), (mouse.clientX - barrel.cx));
            var degrees = Math.round(radians * 180 / Math.PI);
            return degrees;
        };

        var _rotate = function(el, degrees){
            $angular.element(el).css({
                transform: 'rotate(' + degrees + 'deg)'
            });
        };

        var _timeCalc = function(degree, beat){
            var t, decimal = 3 + (1/30) * (degree % 360);
            decimal = decimal < 0 ? decimal + 12 : decimal;

            t = parseInt(decimal);
            if(beat === 'm') {
                t = parseInt(decimal * 5) % 60;
            }

            return t;
        };

        return {
			restrict: 'E',
			replace: true,

			scope: {
				time: '=?',
                diameter: '=?',
                unit: '=?'
			},

			template: '' +
                '<div class="time-dial barrel" ng-style="styleMe(unit)">' +
                    '<div class="lcd" hm-tap="toggleMeridiem()">' +
                        '<div class="time">{{format(time)|date:\'h\'}}:{{format(time)|date:\'mm\'}}</div>' +
                        '<div class="meridiem">{{format(time)|date:\'a\'}}</div>' +
                    '</div>' +
                    '<div class="crown hour"><span hm-pan="setCrown($event, \'h\')"></span></div>' +
                    '<div class="crown minute"><span hm-pan="setCrown($event, \'m\')"></span></div>' +
                '</div>' +
                '',

			link: function(scope, element) {

                if(!scope.time) {
                    scope.time = $moment(); // current time
                }

                var crownMinute = $angular.element(element.find('.minute'));
                var crownHour = $angular.element(element.find('.hour'));

                var calibrate = function(time, beat){
                    time = !time ? scope.time : time;
                    var minute = time.minutes();
                    var hour = time.hours();

                    var degreeMinute = (minute * 6) - 90;
                    // -90: top of clock is not 0

                    var degreeHour = (hour * 30 + minute * 0.5) - 450;
                    // -450: top of clock is not 0, hour degree calibration

                    if(!beat || beat === 'm') {
                        _rotate(crownMinute, degreeMinute);
                    }
                    if(!beat || beat === 'h') {
                        _rotate(crownHour, degreeHour);
                    }
                };

                scope.meridiem = scope.time.format('a') === 'am' ? 'am' : 'pm';

                scope.format = function(datetime){
                      return new Date(datetime);
                };

                scope.styleMe = function(unit){
                    unit = !unit ? 'vmin' : unit; // vmin: viewport smallest dimension
                    return { fontSize: scope.diameter + unit};
                };

                scope.toggleMeridiem = function(){
                    if(scope.meridiem === 'am') {
                        scope.time.add(12, 'hours');
                        scope.meridiem = 'pm';
                    } else {
                        scope.time.subtract(12, 'hours');
                        scope.meridiem = 'am';
                    }
                };

                scope.setCrown = function(e, beat){
                    var degrees = _getDeg(e.pointers[0], element[0]);
                    var time = _timeCalc(degrees, beat);

                    if(beat === 'm') {
                        scope.time.minute(time);
                        calibrate(scope.time, 'h');
                    } else {
                        if(scope.meridiem === 'pm') {
                            time += 12;
                        }
                        scope.time.hour(time);
                    }

                    calibrate(scope.time, beat);
                };

                // init
                calibrate();
			}
		};
	}]);

})(window.angular, window.moment);
