(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var DataExample = require('./dataExample.js');
var Batch = require('./batch.js');
var ChartLoader = require('./chartLoader.js');

var data = new DataExample(5);
var batch = new Batch(data.getData());

window.onload = function () {
	console.log(batch);
	window.chartLoader = new ChartLoader(batch);
	chartLoader.insertBatch(batch);
};

},{"./batch.js":2,"./chartLoader.js":3,"./dataExample.js":4}],2:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * This class handles how a batch behaves. A batch is a set of data, that has been downloaded from a remote server
 * Class provides methods for getting next items in the queue that contains data
 */

var Batch = (function () {
	function Batch(data) {
		_classCallCheck(this, Batch);

		this._dataStore = data; //typeof DataEntry
		this.createdOn = new Date();
		this.addUntilNextDuration();
		this.batchDuration = this._batchDuration();
	}

	_createClass(Batch, [{
		key: "addUntilNextDuration",
		value: function addUntilNextDuration() {
			var _this = this;

			this._dataStore.forEach(function (dataPoint, index) {
				if (index + 1 != _this._dataStore.length) {
					dataPoint.untilNext = Math.abs(_this._dataStore[index + 1].timeStamp - dataPoint.timeStamp);
				}
			}, this);
		}
	}, {
		key: "_batchDuration",
		value: function _batchDuration() {
			return this._dataStore.reduce(function (prev, curr) {
				if (curr.untilNext) {
					return prev + curr.untilNext;
				} else {
					return prev + 0;
				}
			}, 0);
		}
	}, {
		key: "next",
		value: function next() {
			return this._dataStore.shift();
		}
	}]);

	return Batch;
})();

module.exports = Batch;

},{}],3:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/**
 * ChartLoader
 */
var DataExample = require('./dataExample.js');
var Batch = require('./batch.js');
var Progressbar = require('./progress-bar.js');

var ChartLoader = (function () {
  function ChartLoader(batch) {
    _classCallCheck(this, ChartLoader);

    this.progressbar = new Progressbar($('.progress-bar'));
    this.cumulativeDuration = 0;
    this._constructChart();
  }

  _createClass(ChartLoader, [{
    key: '_constructChart',
    value: function _constructChart() {
      var canvas = document.getElementById('updating-chart'),
          ctx = canvas.getContext('2d'),
          startingData = {
        labels: [1, 2, 3, 4, 5, 6, 7],
        datasets: [{
          fillColor: '#EF9A31',
          strokeColor: '#C27E2A',
          pointColor: '#C27E2A',
          pointStrokeColor: '#fff',
          data: [65, 59, 80, 81, 56, 55, 40]
        }]
      };
      this.latestLabel = startingData.labels[6];

      // Reduce the animation steps for demo clarity.
      this.chart = new Chart(ctx).Bar(startingData, { animationSteps: 15 });
    }
  }, {
    key: 'addData',
    value: function addData(data) {
      this.cumulativeDuration = this.cumulativeDuration + data.untilNext;
      // Add two random numbers for each dataset
      this.chart.addData([data.value], ++this.latestLabel);
      // Remove the first point so we dont just add values forever
      this.chart.removeData();
      this.updateProgresbar();
    }
  }, {
    key: 'updateProgresbar',
    value: function updateProgresbar() {
      this.progressbar.update(this.cumulativeDuration / this.batch.batchDuration * 100);
    }
  }, {
    key: 'resetProgressbar',
    value: function resetProgressbar() {
      this.cumulativeDuration = 0;
      this.updateProgresbar();
    }
  }, {
    key: 'beginUpdate',
    value: function beginUpdate() {
      var nextDataPoint = this.batch.next();
      if (nextDataPoint === undefined) {
        this.batchFinished();
      } else {
        this.setUpdateTimer(nextDataPoint);
      }
    }
  }, {
    key: 'endUpdate',
    value: function endUpdate() {
      clearTimeout(this.timerID);
    }
  }, {
    key: 'insertBatch',
    value: function insertBatch(batch) {
      this.batch = batch;
      this.latestLabel = 0;
      this.resetProgressbar();
      this.beginUpdate();
    }
  }, {
    key: 'batchFinished',

    //This method should call the server to fetch new data.
    value: function batchFinished() {
      console.log('batch finished, loading a new one');
      this.endUpdate();
      var data = new DataExample(100);
      var batch = new Batch(data.getData());
      this.insertBatch(batch);
    }
  }, {
    key: 'setUpdateTimer',
    value: function setUpdateTimer(data) {
      var _this = this;

      clearTimeout(this.timerID);
      this.timerID = setTimeout(function () {
        _this.addData(data);
        _this.beginUpdate();
      }, data.untilNext);
    }
  }]);

  return ChartLoader;
})();

module.exports = ChartLoader;

},{"./batch.js":2,"./dataExample.js":4,"./progress-bar.js":5}],4:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * DataExample
 * Generates data for testing purposes
 */

var DataExample = (function () {
	function DataExample(dataPoints) {
		_classCallCheck(this, DataExample);

		this.dataPoints = dataPoints;
		this.from = new Date();
		this._data = this.generate();
	}

	_createClass(DataExample, [{
		key: "generate",
		value: function generate() {
			var len = this.dataPoints;
			var ret = [];

			for (var i = 0; i < len; i++) {
				var randomDuration = this.randomIntFromInterval(2000, 4000); //Random duration between veneer mats.
				ret.push({
					value: Math.random() * 100,
					timeStamp: randomDuration + this.from.getTime()
				});
			}
			return ret;
		}
	}, {
		key: "getData",
		value: function getData() {
			return this._data;
		}
	}, {
		key: "randomIntFromInterval",
		value: function randomIntFromInterval(min, max) {
			return Math.floor(Math.random() * (max - min + 1) + min);
		}
	}]);

	return DataExample;
})();

module.exports = DataExample;

},{}],5:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Progressbar = (function () {
	/**
  *
  */

	function Progressbar($target) {
		_classCallCheck(this, Progressbar);

		this.$target = $target;
	}

	_createClass(Progressbar, [{
		key: 'update',
		value: function update(val) {
			this.$target.attr('data-transitiongoal', val).progressbar();
		}
	}]);

	return Progressbar;
})();

module.exports = Progressbar;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9uZWdyYWwvRG9jdW1lbnRzL05vZGVQcm9qZWN0cy9MaXZlRGF0YVRyYW5zZmVyL2pzL3NyYy9tYWluLmpzIiwiQzovVXNlcnMvbmVncmFsL0RvY3VtZW50cy9Ob2RlUHJvamVjdHMvTGl2ZURhdGFUcmFuc2Zlci9qcy9zcmMvYmF0Y2guanMiLCJDOi9Vc2Vycy9uZWdyYWwvRG9jdW1lbnRzL05vZGVQcm9qZWN0cy9MaXZlRGF0YVRyYW5zZmVyL2pzL3NyYy9jaGFydExvYWRlci5qcyIsIkM6L1VzZXJzL25lZ3JhbC9Eb2N1bWVudHMvTm9kZVByb2plY3RzL0xpdmVEYXRhVHJhbnNmZXIvanMvc3JjL2RhdGFFeGFtcGxlLmpzIiwiQzovVXNlcnMvbmVncmFsL0RvY3VtZW50cy9Ob2RlUHJvamVjdHMvTGl2ZURhdGFUcmFuc2Zlci9qcy9zcmMvcHJvZ3Jlc3MtYmFyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUM5QyxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDbEMsSUFBSSxXQUFXLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7O0FBRzlDLElBQUksSUFBSSxHQUFHLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlCLElBQUksS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDOztBQUV0QyxNQUFNLENBQUMsTUFBTSxHQUFHLFlBQU07QUFDckIsUUFBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNuQixPQUFNLENBQUMsV0FBVyxHQUFHLElBQUksV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzVD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Iiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgRGF0YUV4YW1wbGUgPSByZXF1aXJlKCcuL2RhdGFFeGFtcGxlLmpzJyk7XHJcbnZhciBCYXRjaCA9IHJlcXVpcmUoJy4vYmF0Y2guanMnKTtcclxudmFyIENoYXJ0TG9hZGVyID0gcmVxdWlyZSgnLi9jaGFydExvYWRlci5qcycpO1xyXG5cclxuXHJcbnZhciBkYXRhID0gbmV3IERhdGFFeGFtcGxlKDUpO1xyXG52YXIgYmF0Y2ggPSBuZXcgQmF0Y2goZGF0YS5nZXREYXRhKCkpO1xyXG5cclxud2luZG93Lm9ubG9hZCA9ICgpID0+IHtcclxuXHRjb25zb2xlLmxvZyhiYXRjaCk7XHJcblx0d2luZG93LmNoYXJ0TG9hZGVyID0gbmV3IENoYXJ0TG9hZGVyKGJhdGNoKTtcclxuXHRjaGFydExvYWRlci5pbnNlcnRCYXRjaChiYXRjaCk7XHJcbn0iLCJcdC8qKlxyXG5cdCAqIFRoaXMgY2xhc3MgaGFuZGxlcyBob3cgYSBiYXRjaCBiZWhhdmVzLiBBIGJhdGNoIGlzIGEgc2V0IG9mIGRhdGEsIHRoYXQgaGFzIGJlZW4gZG93bmxvYWRlZCBmcm9tIGEgcmVtb3RlIHNlcnZlclxyXG5cdCAqIENsYXNzIHByb3ZpZGVzIG1ldGhvZHMgZm9yIGdldHRpbmcgbmV4dCBpdGVtcyBpbiB0aGUgcXVldWUgdGhhdCBjb250YWlucyBkYXRhXHJcblx0ICovXHJcblxyXG5jbGFzcyBCYXRjaCB7XHJcblx0Y29uc3RydWN0b3IoZGF0YSkge1xyXG5cdFx0dGhpcy5fZGF0YVN0b3JlID0gZGF0YTsgLy90eXBlb2YgRGF0YUVudHJ5XHJcblx0XHR0aGlzLmNyZWF0ZWRPbiA9IG5ldyBEYXRlKCk7XHJcblx0XHR0aGlzLmFkZFVudGlsTmV4dER1cmF0aW9uKCk7XHJcblx0XHR0aGlzLmJhdGNoRHVyYXRpb24gPSB0aGlzLl9iYXRjaER1cmF0aW9uKCk7XHJcblx0fVxyXG5cdGFkZFVudGlsTmV4dER1cmF0aW9uKCl7XHJcblx0XHR0aGlzLl9kYXRhU3RvcmUuZm9yRWFjaCgoZGF0YVBvaW50LCBpbmRleCkgPT4ge1xyXG5cdFx0XHRpZihpbmRleCArIDEgIT0gdGhpcy5fZGF0YVN0b3JlLmxlbmd0aCl7XHJcblx0XHRcdFx0ZGF0YVBvaW50LnVudGlsTmV4dCA9IE1hdGguYWJzKHRoaXMuX2RhdGFTdG9yZVtpbmRleCArIDFdLnRpbWVTdGFtcCAtIGRhdGFQb2ludC50aW1lU3RhbXApO1xyXG5cdFx0XHR9XHJcblx0XHR9LCB0aGlzKTtcclxuXHR9XHJcblx0XHJcblx0X2JhdGNoRHVyYXRpb24oKXtcclxuXHRcdHJldHVybiB0aGlzLl9kYXRhU3RvcmUucmVkdWNlKChwcmV2LCBjdXJyKSA9PiB7XHJcblx0XHRcdGlmKGN1cnIudW50aWxOZXh0KSB7XHJcblx0XHRcdFx0cmV0dXJuIHByZXYgKyBjdXJyLnVudGlsTmV4dDtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4gcHJldiArIDA7XHJcblx0XHRcdH1cclxuXHRcdH0sIDApO1xyXG5cdH1cclxuXHRcclxuXHRuZXh0KCl7XHJcblx0XHRyZXR1cm4gdGhpcy5fZGF0YVN0b3JlLnNoaWZ0KCk7XHJcblx0fVxyXG5cdFxyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCYXRjaDsiLCIvKipcclxuICogQ2hhcnRMb2FkZXJcclxuICovXHJcbnZhciBEYXRhRXhhbXBsZSA9IHJlcXVpcmUoJy4vZGF0YUV4YW1wbGUuanMnKTtcclxudmFyIEJhdGNoID0gcmVxdWlyZSgnLi9iYXRjaC5qcycpO1xyXG52YXIgUHJvZ3Jlc3NiYXIgPSByZXF1aXJlKCcuL3Byb2dyZXNzLWJhci5qcycpO1xyXG5cclxuY2xhc3MgQ2hhcnRMb2FkZXIge1xyXG5cdGNvbnN0cnVjdG9yKGJhdGNoKSB7XHJcbiAgICB0aGlzLnByb2dyZXNzYmFyID0gbmV3IFByb2dyZXNzYmFyKCQoJy5wcm9ncmVzcy1iYXInKSk7XHJcbiAgICB0aGlzLmN1bXVsYXRpdmVEdXJhdGlvbiA9IDA7XHJcbiAgICB0aGlzLl9jb25zdHJ1Y3RDaGFydCgpO1xyXG4gIH1cclxuXHJcbiAgX2NvbnN0cnVjdENoYXJ0KCl7XHJcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VwZGF0aW5nLWNoYXJ0JyksXHJcbiAgICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKSxcclxuICAgIHN0YXJ0aW5nRGF0YSA9IHtcclxuICAgICAgbGFiZWxzOiBbMSwgMiwgMywgNCwgNSwgNiwgN10sXHJcbiAgICAgIGRhdGFzZXRzOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgZmlsbENvbG9yOiBcIiNFRjlBMzFcIixcclxuICAgICAgICAgICAgICBzdHJva2VDb2xvcjogXCIjQzI3RTJBXCIsXHJcbiAgICAgICAgICAgICAgcG9pbnRDb2xvcjogXCIjQzI3RTJBXCIsXHJcbiAgICAgICAgICAgICAgcG9pbnRTdHJva2VDb2xvcjogXCIjZmZmXCIsXHJcbiAgICAgICAgICAgICAgZGF0YTogWzY1LCA1OSwgODAsIDgxLCA1NiwgNTUsIDQwXVxyXG4gICAgICAgICAgfVxyXG4gICAgICBdXHJcbiAgICB9O1xyXG4gICAgdGhpcy5sYXRlc3RMYWJlbCA9IHN0YXJ0aW5nRGF0YS5sYWJlbHNbNl07XHJcblxyXG4gIC8vIFJlZHVjZSB0aGUgYW5pbWF0aW9uIHN0ZXBzIGZvciBkZW1vIGNsYXJpdHkuXHJcbiAgdGhpcy5jaGFydCA9IG5ldyBDaGFydChjdHgpLkJhcihzdGFydGluZ0RhdGEsIHthbmltYXRpb25TdGVwczogMTV9KTtcclxuICB9XHJcbiAgXHJcbiAgYWRkRGF0YShkYXRhKXtcclxuICAgIHRoaXMuY3VtdWxhdGl2ZUR1cmF0aW9uID0gdGhpcy5jdW11bGF0aXZlRHVyYXRpb24gKyBkYXRhLnVudGlsTmV4dDtcclxuICAgIC8vIEFkZCB0d28gcmFuZG9tIG51bWJlcnMgZm9yIGVhY2ggZGF0YXNldFxyXG4gICAgdGhpcy5jaGFydC5hZGREYXRhKFtkYXRhLnZhbHVlXSwgKyt0aGlzLmxhdGVzdExhYmVsKTtcclxuICAgIC8vIFJlbW92ZSB0aGUgZmlyc3QgcG9pbnQgc28gd2UgZG9udCBqdXN0IGFkZCB2YWx1ZXMgZm9yZXZlclxyXG4gICAgdGhpcy5jaGFydC5yZW1vdmVEYXRhKCk7XHJcbiAgICB0aGlzLnVwZGF0ZVByb2dyZXNiYXIoKTtcclxuICB9XHJcbiAgXHJcbiAgdXBkYXRlUHJvZ3Jlc2Jhcigpe1xyXG4gICAgdGhpcy5wcm9ncmVzc2Jhci51cGRhdGUoKHRoaXMuY3VtdWxhdGl2ZUR1cmF0aW9uIC8gdGhpcy5iYXRjaC5iYXRjaER1cmF0aW9uKSAqIDEwMCApO1xyXG4gIH1cclxuICBcclxuICByZXNldFByb2dyZXNzYmFyKCl7XHJcbiAgICB0aGlzLmN1bXVsYXRpdmVEdXJhdGlvbiA9IDA7XHJcbiAgICB0aGlzLnVwZGF0ZVByb2dyZXNiYXIoKTtcclxuICB9XHJcbiAgXHJcbiAgYmVnaW5VcGRhdGUoKXtcclxuICAgIHZhciBuZXh0RGF0YVBvaW50ID0gdGhpcy5iYXRjaC5uZXh0KCk7XHJcbiAgICBpZihuZXh0RGF0YVBvaW50ID09PSB1bmRlZmluZWQpe1xyXG4gICAgICB0aGlzLmJhdGNoRmluaXNoZWQoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuc2V0VXBkYXRlVGltZXIobmV4dERhdGFQb2ludCk7XHJcbiAgICB9XHJcblxyXG4gIH1cclxuICBcclxuICBlbmRVcGRhdGUoKXtcclxuICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVySUQpO1xyXG4gIH1cclxuICBcclxuICBpbnNlcnRCYXRjaChiYXRjaCl7XHJcbiAgICB0aGlzLmJhdGNoID0gYmF0Y2g7XHJcbiAgICB0aGlzLmxhdGVzdExhYmVsID0gMDtcclxuICAgIHRoaXMucmVzZXRQcm9ncmVzc2JhcigpO1xyXG4gICAgdGhpcy5iZWdpblVwZGF0ZSgpO1xyXG4gIH1cclxuICBcclxuICAvL1RoaXMgbWV0aG9kIHNob3VsZCBjYWxsIHRoZSBzZXJ2ZXIgdG8gZmV0Y2ggbmV3IGRhdGEuXHJcblx0YmF0Y2hGaW5pc2hlZCgpe1xyXG4gICAgY29uc29sZS5sb2coJ2JhdGNoIGZpbmlzaGVkLCBsb2FkaW5nIGEgbmV3IG9uZScpO1xyXG4gICAgdGhpcy5lbmRVcGRhdGUoKTtcclxuICAgIHZhciBkYXRhID0gbmV3IERhdGFFeGFtcGxlKDEwMCk7XHJcbiAgICB2YXIgYmF0Y2ggPSBuZXcgQmF0Y2goZGF0YS5nZXREYXRhKCkpO1xyXG5cdFx0dGhpcy5pbnNlcnRCYXRjaChiYXRjaCk7XHJcblx0fVxyXG4gIFxyXG4gIHNldFVwZGF0ZVRpbWVyKGRhdGEpe1xyXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZXJJRCk7XHJcbiAgICB0aGlzLnRpbWVySUQgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgdGhpcy5hZGREYXRhKGRhdGEpO1xyXG4gICAgICB0aGlzLmJlZ2luVXBkYXRlKCk7XHJcbiAgICB9LCBkYXRhLnVudGlsTmV4dCk7XHJcbiAgICBcclxuICB9XHJcbiAgXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2hhcnRMb2FkZXI7IiwiLyoqXHJcbiAqIERhdGFFeGFtcGxlXHJcbiAqIEdlbmVyYXRlcyBkYXRhIGZvciB0ZXN0aW5nIHB1cnBvc2VzXHJcbiAqL1xyXG5jbGFzcyBEYXRhRXhhbXBsZSB7XHJcblx0Y29uc3RydWN0b3IoZGF0YVBvaW50cykge1xyXG5cdFx0dGhpcy5kYXRhUG9pbnRzID0gZGF0YVBvaW50cztcclxuXHRcdHRoaXMuZnJvbSA9ICBuZXcgRGF0ZSgpO1xyXG5cdFx0dGhpcy5fZGF0YSA9IHRoaXMuZ2VuZXJhdGUoKTtcclxuXHR9XHJcblx0XHJcblx0Z2VuZXJhdGUoKXtcclxuXHRcdHZhciBsZW4gPSB0aGlzLmRhdGFQb2ludHM7XHJcblx0XHR2YXIgcmV0ID0gW107XHJcblx0XHRcclxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBsZW47IGkrKyl7XHJcblx0XHRcdHZhciByYW5kb21EdXJhdGlvbiA9IHRoaXMucmFuZG9tSW50RnJvbUludGVydmFsKDIwMDAsIDQwMDApOyAvL1JhbmRvbSBkdXJhdGlvbiBiZXR3ZWVuIHZlbmVlciBtYXRzLlxyXG5cdFx0XHRyZXQucHVzaCh7XHJcblx0XHRcdFx0dmFsdWU6IE1hdGgucmFuZG9tKCkgKiAxMDAsXHJcblx0XHRcdFx0dGltZVN0YW1wOiByYW5kb21EdXJhdGlvbiArIHRoaXMuZnJvbS5nZXRUaW1lKClcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gcmV0O1xyXG5cdH1cclxuXHRcclxuXHRnZXREYXRhKCl7XHJcblx0XHRyZXR1cm4gdGhpcy5fZGF0YTtcclxuXHR9XHJcblx0XHJcblx0cmFuZG9tSW50RnJvbUludGVydmFsKG1pbixtYXgpXHJcblx0e1xyXG4gICAgXHRyZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKihtYXgtbWluKzEpK21pbik7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IERhdGFFeGFtcGxlOyIsImNsYXNzIFByb2dyZXNzYmFye1xyXG5cdC8qKlxyXG5cdCAqXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoJHRhcmdldCkge1xyXG5cdFx0dGhpcy4kdGFyZ2V0ID0gJHRhcmdldDtcclxuXHR9XHJcblx0XHJcblx0dXBkYXRlKHZhbCl7XHJcblx0XHR0aGlzLiR0YXJnZXQuYXR0cignZGF0YS10cmFuc2l0aW9uZ29hbCcsIHZhbCkucHJvZ3Jlc3NiYXIoKTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUHJvZ3Jlc3NiYXI7Il19
