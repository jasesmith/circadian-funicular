(function($angular, $moment){
	'use strict';

    // helpers
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

	$angular.module('app')
	.directive('timeDial', ['$interval', function($interval) {
        return {
			restrict: 'E',
			replace: true,

			scope: {
				time: '=?',
                diameter: '=?',
                unit: '=?',
                mode: '@'
			},

			template: '<div>' +
                '<div class="time-dial barrel" ng-class="{\'clock-mode\': mode == \'tell\'}" ng-style="size(unit)">' +
                    '<div class="lcd" hm-tap="toggleMeridiem()">' +
                        '<div class="seconds" ng-if="mode==\'tell\'">{{format(time)|date:\'ss\'}}</div>' +
                        '<div class="seconds" ng-if="mode!=\'tell\'">{{prevTick}}/{{rev}}</div>' +
                        '<div class="time">{{format(time)|date:\'h\'}}<span>:</span>{{format(time)|date:\'mm\'}}</div>' +
                        '<div class="meridiem">{{format(time)|date:\'a\'}}</div>' +
                    '</div>' +
                    '<div class="crown hour"><span hm-pan="setCrown($event, \'h\')"></span></div>' +
                    '<div class="crown minute"><span hm-pan="setCrown($event, \'m\')"></span></div>' +
                '</div>' +
                '</div>',

			link: function(scope, element) {

                if(!scope.time) {
                    scope.time = $moment(); // current time
                }

                if(!scope.mode) {
                    scope.mode = 'set'; // current time
                }

                scope.rev = 0;

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

                scope.size = function(unit){
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
                    var tick = _timeCalc(degrees, beat);
                    var t = scope.time; // storing for natural progression
					var h = scope.time.hour();

                    if(beat === 'm') {
                        scope.time.minute(tick);

						// going forwards
                        if(scope.prevTick === 59 && tick === 0) {
                            t = scope.time.add(1, 'hour');
                        }

						// going backwards
                        if(scope.prevTick === 0 && tick === 59) {
                            t = scope.time.subtract(1, 'hour');
                        }

                        calibrate(t, 'h');
                    } else {
						tick = h > 11 ? tick + 12 : tick;

                        // going forwards
                        if(scope.prevTick === 11 && tick === 0) {
							tick += 12;
                        } else if(scope.prevTick === 23 && tick === 12) {
                            scope.time.add(1, 'day');
                            tick -= 12;
                        }

                        // going backwards
						if(scope.prevTick === 12 && tick === 23) {
                            tick -= 12;
                        } else if(scope.prevTick === 0 && tick === 11) {
                            scope.time.subtract(1, 'day');
                            tick += 12;
                        }

                        // _rotate(crownHour, degrees); // smooth move
                        scope.time.hour(tick);
                    }

                    calibrate(scope.time, beat);
                    scope.prevTick = tick;
                };

                // init
                calibrate();
                if(scope.mode === 'tell') {
                    $interval(function(){
                        scope.time = $moment();
                        calibrate(scope.time);
                    }, 500);
                }
			}
		};
	}]);

})(window.angular, window.moment);
