(function($angular, $moment, Hammer){
  'use strict';

  $angular.module('app')
  .directive('timeDial', ['$timeout', '$interval', function($timeout, $interval) {
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

    var _getDeg = function(input, b){
      var barrel = _getNumbers(b);
      var radians = Math.atan2((input.clientY - barrel.cy), (input.clientX - barrel.cx));
      var degrees = Math.round(radians * 180 / Math.PI);
      return degrees;
    };

    var _rotate = function(el, degrees){
      $angular.element(el).css({
        transform: 'rotate(' + degrees + 'deg)'
      });
    };

    var _timeCalc = function(degree, beat){
      var t = 0;
      var decimal = Math.PI + (1/30) * (degree % 360);

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
        unit: '=?',
        mode: '@'
      },

      template: '' +
        '<div class="time-dial barrel" ng-class="{\'active-touch\': touching, \'clock-mode\': mode == \'tell\'}" ng-style="size(unit)">' +
          '<div class="lcd {{meridiem}}" ng-class="{\'toggled\': toggled}">' +
            '<div class="seconds" ng-if="mode==\'tell\'">{{format(time)|date:\'ss\'}}</div>' +
            '<div class="time" data-title="{{format(time)|date:\'h:mm\'}}">{{format(time)|date:\'h\'}}<span>:</span>{{format(time)|date:\'mm\'}}</div>' +
            '<div class="meridiem" data-title="{{meridiem}}">{{meridiem}}</div>' +
          '</div>' +
          '<div class="crown hour"><span beat="h"></span></div>' +
          '<div class="crown minute"><span beat="m"></span></div>' +
        '</div>' +
        '',

      link: function(scope, element) {

        if(!scope.time) {
          scope.time = $moment(); // current time
        }

        if(!scope.mode) {
          scope.mode = 'set'; // current time
        }

        var crownMinute = $angular.element(element[0].querySelector('.minute'));
        var crownHour = $angular.element(element[0].querySelector('.hour'));
        var lcd = $angular.element(element[0].querySelector('.lcd'));

        var setMeridiem = function(time){
          time = !time ? scope.time : time;
          var minute = time.minutes();
          var hour = time.hours();
          if(hour === 12 && minute === 0) {
            scope.meridiem = 'Noon';
          } else if(hour === 0 && minute === 0) {
            scope.meridiem = 'Midnight';
          } else {
            scope.meridiem = time.format('a');
          }
        };

        var calibrate = function(time, beat){
          time = !time ? scope.time : time;
          var minute = time.minutes();
          var hour = time.hours();
          var degreeMinute = (minute * 6);
          var degreeHour = (hour * 30 + minute * 0.5);

          if(!beat || beat === 'm') {
            _rotate(crownMinute, degreeMinute);
          }
          if(!beat || beat === 'h') {
            _rotate(crownHour, degreeHour);
          }
          setMeridiem(time);
        };

        var uiToggleMeridiem = function(){
          if(scope.time.format('a') === 'am') {
            scope.time.add(12, 'hours');
          } else {
            scope.time.subtract(12, 'hours');
          }
          setMeridiem(scope.time);
          scope.toggled = true;
          $timeout(function(){
            scope.toggled = false;
          }, 300);
		  scope.$apply();
        };

        var uiSetCrown = function(e, beat){
          var input = e.srcEvent && e.srcEvent.changedTouches ? e.srcEvent.changedTouches : e.pointers;
          var degrees = _getDeg(input[0], element[0]);
          var tick = _timeCalc(degrees, beat);
          var h = scope.time.hour();

          if(beat === 'm') {
            // going forwards
            if(scope.prevTick === 59 && tick === 0) {
              scope.time.add(1, 'hour');
            }

            // going backwards
            else if(scope.prevTick === 0 && tick === 59) {
              scope.time.subtract(1, 'hour');
            }

            scope.time.minute(tick);
          }

          if(beat === 'h') {
            tick = h > 11 ? tick + 12 : tick;

            // going forwards
            if(scope.prevTick === 11 && tick === 0) {
              tick += 12;
            }
            else if(scope.prevTick === 23 && tick === 12) {
              scope.time.add(1, 'day');
              tick -= 12;
            }

            // going backwards
            else if(scope.prevTick === 12 && tick === 23) {
              tick -= 12;
            }
            else if(scope.prevTick === 0 && tick === 11) {
              scope.time.subtract(1, 'day');
              tick += 12;
            }

            scope.time.hour(tick);
          }

          scope.prevTick = tick;
          calibrate();
          scope.$apply();
        };

        scope.format = function(datetime){
          return new Date(datetime);
        };

        scope.size = function(unit){
          unit = !unit ? 'vmin' : unit; // vmin: viewport smallest dimension
          return { fontSize: scope.diameter + unit};
        };

        // hammer time
        scope.touching = false;
        var hammerMinute = new Hammer(crownMinute[0]);
        var hammerHour = new Hammer(crownHour[0]);
        var hammerLcd = new Hammer(lcd[0], {});
        var hammerOptions = {
          direction: Hammer.DIRECTION_ALL,
          threshold: 0
        };

        hammerMinute.get('pan').set(hammerOptions);
        hammerMinute.on('pan panend pancancel', function(e) {
          var touching = e.type === 'panend' || e.type === 'pancancel' ? false : true;
          scope.touching = e.srcEvent && e.srcEvent.changedTouches ? touching : false;
          uiSetCrown(e, 'm');
        });

        hammerHour.get('pan').set(hammerOptions);
        hammerHour.on('pan panend pancancel', function(e) {
          var touching = e.type === 'panend' || e.type === 'pancancel' ? false : true;
          scope.touching = e.srcEvent && e.srcEvent.changedTouches ? touching : false;
          uiSetCrown(e, 'h');
        });

        hammerLcd.on('tap', function() {
          uiToggleMeridiem();
        });

        // hehe... watch time... get it?
        scope.$watch('time', function(time){
          calibrate(time);
        });

        if(scope.mode === 'tell') {
          $interval(function(){
            scope.time = $moment();
            calibrate(scope.time);
          }, 500);
        }
      }
    };
  }]);

})(window.angular, window.moment, window.Hammer);
