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

var ChartLoader = (function () {
  function ChartLoader(batch) {
    _classCallCheck(this, ChartLoader);

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
      console.log('Adding:', data);
      // Add two random numbers for each dataset
      this.chart.addData([data.value], ++this.latestLabel);
      // Remove the first point so we dont just add values forever
      this.chart.removeData();
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
      this.beginUpdate();
    }
  }, {
    key: 'batchFinished',

    //This method should call the server to fetch new data.
    value: function batchFinished() {
      console.log('batch finished, loading a new one');
      this.endUpdate();
      var data = new DataExample(10);
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

},{"./batch.js":2,"./dataExample.js":4}],4:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjOi9Vc2Vycy9uZWdyYWwvRG9jdW1lbnRzL05vZGVQcm9qZWN0cy9MaXZlRGF0YVRyYW5zZmVyL2pzL3NyYy9tYWluLmpzIiwiYzovVXNlcnMvbmVncmFsL0RvY3VtZW50cy9Ob2RlUHJvamVjdHMvTGl2ZURhdGFUcmFuc2Zlci9qcy9zcmMvYmF0Y2guanMiLCJjOi9Vc2Vycy9uZWdyYWwvRG9jdW1lbnRzL05vZGVQcm9qZWN0cy9MaXZlRGF0YVRyYW5zZmVyL2pzL3NyYy9jaGFydExvYWRlci5qcyIsImM6L1VzZXJzL25lZ3JhbC9Eb2N1bWVudHMvTm9kZVByb2plY3RzL0xpdmVEYXRhVHJhbnNmZXIvanMvc3JjL2RhdGFFeGFtcGxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUM5QyxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDbEMsSUFBSSxXQUFXLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7O0FBRTlDLElBQUksSUFBSSxHQUFHLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlCLElBQUksS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDOztBQUV0QyxNQUFNLENBQUMsTUFBTSxHQUFHLFlBQU07QUFDckIsUUFBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNuQixPQUFNLENBQUMsV0FBVyxHQUFHLElBQUksV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzVDLFlBQVcsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7Q0FDL0IsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7SUNOSyxLQUFLO0FBQ0MsVUFETixL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RSxDQUFDO0VBQzdCOztjQUxJLFdBQVc7O1NBT1Isb0JBQUU7QUFDVCxPQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO0FBQzFCLE9BQUksR0FBRyxHQUFHLEVBQUUsQ0FBQzs7QUFFYixRQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFDO0FBQzNCLFFBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDNUQsT0FBRyxDQUFDLElBQUksQ0FBQztBQUNSLFVBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRztBQUMxQixjQUFTLEVBQUUsY0FBYyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO0tBQy9DLENBQUMsQ0FBQztJQUNIO0FBQ0QsVUFBTyxHQUFHLENBQUM7R0FDWDs7O1NBRU0sbUJBQUU7QUFDUixVQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7R0FDbEI7OztTQUVvQiwrQkFBQyxHQUFHLEVBQUMsR0FBRyxFQUM3QjtBQUNJLFVBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUUsR0FBRyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUEsQUFBQyxHQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQ3BEOzs7UUE1QkksV0FBVzs7O0FBK0JqQixNQUFNLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgRGF0YUV4YW1wbGUgPSByZXF1aXJlKCcuL2RhdGFFeGFtcGxlLmpzJyk7XHJcbnZhciBCYXRjaCA9IHJlcXVpcmUoJy4vYmF0Y2guanMnKTtcclxudmFyIENoYXJ0TG9hZGVyID0gcmVxdWlyZSgnLi9jaGFydExvYWRlci5qcycpO1xyXG5cclxudmFyIGRhdGEgPSBuZXcgRGF0YUV4YW1wbGUoNSk7XHJcbnZhciBiYXRjaCA9IG5ldyBCYXRjaChkYXRhLmdldERhdGEoKSk7XHJcblxyXG53aW5kb3cub25sb2FkID0gKCkgPT4ge1xyXG5cdGNvbnNvbGUubG9nKGJhdGNoKTtcclxuXHR3aW5kb3cuY2hhcnRMb2FkZXIgPSBuZXcgQ2hhcnRMb2FkZXIoYmF0Y2gpO1xyXG5cdGNoYXJ0TG9hZGVyLmluc2VydEJhdGNoKGJhdGNoKTtcclxufSIsIlx0LyoqXHJcblx0ICogVGhpcyBjbGFzcyBoYW5kbGVzIGhvdyBhIGJhdGNoIGJlaGF2ZXMuIEEgYmF0Y2ggaXMgYSBzZXQgb2YgZGF0YSwgdGhhdCBoYXMgYmVlbiBkb3dubG9hZGVkIGZyb20gYSByZW1vdGUgc2VydmVyXHJcblx0ICogQ2xhc3MgcHJvdmlkZXMgbWV0aG9kcyBmb3IgZ2V0dGluZyBuZXh0IGl0ZW1zIGluIHRoZSBxdWV1ZSB0aGF0IGNvbnRhaW5zIGRhdGFcclxuXHQgKi9cclxuXHJcbmNsYXNzIEJhdGNoIHtcclxuXHRjb25zdHJ1Y3RvcihkYXRhKSB7XHJcblx0XHR0aGlzLl9kYXRhU3RvcmUgPSBkYXRhOyAvL3R5cGVvZiBEYXRhRW50cnlcclxuXHRcdHRoaXMuY3JlYXRlZE9uID0gbmV3IERhdGUoKTtcclxuXHRcdHRoaXMuYWRkVW50aWxOZXh0RHVyYXRpb24oKTtcclxuXHR9XHJcblx0YWRkVW50aWxOZXh0RHVyYXRpb24oKXtcclxuXHRcdHRoaXMuX2RhdGFTdG9yZS5mb3JFYWNoKChkYXRhUG9pbnQsIGluZGV4KSA9PiB7XHJcblx0XHRcdGlmKGluZGV4ICsgMSAhPSB0aGlzLl9kYXRhU3RvcmUubGVuZ3RoKXtcclxuXHRcdFx0XHRkYXRhUG9pbnQudW50aWxOZXh0ID0gTWF0aC5hYnModGhpcy5fZGF0YVN0b3JlW2luZGV4ICsgMV0udGltZVN0YW1wIC0gZGF0YVBvaW50LnRpbWVTdGFtcCk7XHJcblx0XHRcdH1cclxuXHRcdH0sIHRoaXMpO1xyXG5cdH1cclxuXHRcclxuXHRuZXh0KCl7XHJcblx0XHRyZXR1cm4gdGhpcy5fZGF0YVN0b3JlLnNoaWZ0KCk7XHJcblx0fVxyXG5cdFxyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCYXRjaDsiLCIvKipcclxuICogQ2hhcnRMb2FkZXJcclxuICovXHJcbnZhciBEYXRhRXhhbXBsZSA9IHJlcXVpcmUoJy4vZGF0YUV4YW1wbGUuanMnKTtcclxudmFyIEJhdGNoID0gcmVxdWlyZSgnLi9iYXRjaC5qcycpO1xyXG4gXHJcbmNsYXNzIENoYXJ0TG9hZGVyIHtcclxuXHRjb25zdHJ1Y3RvcihiYXRjaCkge1xyXG4gICAgXHJcbiAgICB0aGlzLl9jb25zdHJ1Y3RDaGFydCgpO1xyXG4gIH1cclxuXHJcbiAgX2NvbnN0cnVjdENoYXJ0KCl7XHJcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VwZGF0aW5nLWNoYXJ0JyksXHJcbiAgICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKSxcclxuICAgIHN0YXJ0aW5nRGF0YSA9IHtcclxuICAgICAgbGFiZWxzOiBbMSwgMiwgMywgNCwgNSwgNiwgN10sXHJcbiAgICAgIGRhdGFzZXRzOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgZmlsbENvbG9yOiBcIiNFRjlBMzFcIixcclxuICAgICAgICAgICAgICBzdHJva2VDb2xvcjogXCIjQzI3RTJBXCIsXHJcbiAgICAgICAgICAgICAgcG9pbnRDb2xvcjogXCIjQzI3RTJBXCIsXHJcbiAgICAgICAgICAgICAgcG9pbnRTdHJva2VDb2xvcjogXCIjZmZmXCIsXHJcbiAgICAgICAgICAgICAgZGF0YTogWzY1LCA1OSwgODAsIDgxLCA1NiwgNTUsIDQwXVxyXG4gICAgICAgICAgfVxyXG4gICAgICBdXHJcbiAgICB9O1xyXG4gICAgdGhpcy5sYXRlc3RMYWJlbCA9IHN0YXJ0aW5nRGF0YS5sYWJlbHNbNl07XHJcblxyXG4gIC8vIFJlZHVjZSB0aGUgYW5pbWF0aW9uIHN0ZXBzIGZvciBkZW1vIGNsYXJpdHkuXHJcbiAgdGhpcy5jaGFydCA9IG5ldyBDaGFydChjdHgpLkJhcihzdGFydGluZ0RhdGEsIHthbmltYXRpb25TdGVwczogMTV9KTtcclxuICB9XHJcbiAgXHJcbiAgYWRkRGF0YShkYXRhKXtcclxuICAgIGNvbnNvbGUubG9nKCdBZGRpbmc6JywgZGF0YSk7XHJcbiAgICAvLyBBZGQgdHdvIHJhbmRvbSBudW1iZXJzIGZvciBlYWNoIGRhdGFzZXRcclxuICAgIHRoaXMuY2hhcnQuYWRkRGF0YShbZGF0YS52YWx1ZV0sICsrdGhpcy5sYXRlc3RMYWJlbCk7XHJcbiAgICAvLyBSZW1vdmUgdGhlIGZpcnN0IHBvaW50IHNvIHdlIGRvbnQganVzdCBhZGQgdmFsdWVzIGZvcmV2ZXJcclxuICAgIHRoaXMuY2hhcnQucmVtb3ZlRGF0YSgpO1xyXG4gIH1cclxuICBcclxuICBcclxuICBiZWdpblVwZGF0ZSgpe1xyXG4gICAgdmFyIG5leHREYXRhUG9pbnQgPSB0aGlzLmJhdGNoLm5leHQoKTtcclxuICAgIGlmKG5leHREYXRhUG9pbnQgPT09IHVuZGVmaW5lZCl7XHJcbiAgICAgIHRoaXMuYmF0Y2hGaW5pc2hlZCgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5zZXRVcGRhdGVUaW1lcihuZXh0RGF0YVBvaW50KTtcclxuICAgIH1cclxuXHJcbiAgfVxyXG4gIFxyXG4gIGVuZFVwZGF0ZSgpe1xyXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZXJJRCk7XHJcbiAgfVxyXG4gIFxyXG4gIGluc2VydEJhdGNoKGJhdGNoKXtcclxuICAgIHRoaXMuYmF0Y2ggPSBiYXRjaDtcclxuICAgIHRoaXMubGF0ZXN0TGFiZWwgPSAwO1xyXG4gICAgdGhpcy5iZWdpblVwZGF0ZSgpO1xyXG4gIH1cclxuICBcclxuICAvL1RoaXMgbWV0aG9kIHNob3VsZCBjYWxsIHRoZSBzZXJ2ZXIgdG8gZmV0Y2ggbmV3IGRhdGEuXHJcblx0YmF0Y2hGaW5pc2hlZCgpe1xyXG4gICAgY29uc29sZS5sb2coJ2JhdGNoIGZpbmlzaGVkLCBsb2FkaW5nIGEgbmV3IG9uZScpO1xyXG4gICAgdGhpcy5lbmRVcGRhdGUoKTtcclxuICAgIHZhciBkYXRhID0gbmV3IERhdGFFeGFtcGxlKDEwKTtcclxuICAgIHZhciBiYXRjaCA9IG5ldyBCYXRjaChkYXRhLmdldERhdGEoKSk7XHJcblx0XHR0aGlzLmluc2VydEJhdGNoKGJhdGNoKTtcclxuXHR9XHJcbiAgXHJcbiAgc2V0VXBkYXRlVGltZXIoZGF0YSl7XHJcbiAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lcklEKTtcclxuICAgIHRoaXMudGltZXJJRCA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICB0aGlzLmFkZERhdGEoZGF0YSk7XHJcbiAgICAgIHRoaXMuYmVnaW5VcGRhdGUoKTtcclxuICAgIH0sIGRhdGEudW50aWxOZXh0KTtcclxuICAgIFxyXG4gIH1cclxuICBcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDaGFydExvYWRlcjsiLCIvKipcclxuICogRGF0YUV4YW1wbGVcclxuICogR2VuZXJhdGVzIGRhdGEgZm9yIHRlc3RpbmcgcHVycG9zZXNcclxuICovXHJcbmNsYXNzIERhdGFFeGFtcGxlIHtcclxuXHRjb25zdHJ1Y3RvcihkYXRhUG9pbnRzKSB7XHJcblx0XHR0aGlzLmRhdGFQb2ludHMgPSBkYXRhUG9pbnRzO1xyXG5cdFx0dGhpcy5mcm9tID0gIG5ldyBEYXRlKCk7XHJcblx0XHR0aGlzLl9kYXRhID0gdGhpcy5nZW5lcmF0ZSgpO1xyXG5cdH1cclxuXHRcclxuXHRnZW5lcmF0ZSgpe1xyXG5cdFx0dmFyIGxlbiA9IHRoaXMuZGF0YVBvaW50cztcclxuXHRcdHZhciByZXQgPSBbXTtcclxuXHRcdFxyXG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKXtcclxuXHRcdFx0dmFyIHJhbmRvbUR1cmF0aW9uID0gdGhpcy5yYW5kb21JbnRGcm9tSW50ZXJ2YWwoMjAwMCwgNDAwMCk7IC8vUmFuZG9tIGR1cmF0aW9uIGJldHdlZW4gdmVuZWVyIG1hdHMuXHJcblx0XHRcdHJldC5wdXNoKHtcclxuXHRcdFx0XHR2YWx1ZTogTWF0aC5yYW5kb20oKSAqIDEwMCxcclxuXHRcdFx0XHR0aW1lU3RhbXA6IHJhbmRvbUR1cmF0aW9uICsgdGhpcy5mcm9tLmdldFRpbWUoKVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdHJldHVybiByZXQ7XHJcblx0fVxyXG5cdFxyXG5cdGdldERhdGEoKXtcclxuXHRcdHJldHVybiB0aGlzLl9kYXRhO1xyXG5cdH1cclxuXHRcclxuXHRyYW5kb21JbnRGcm9tSW50ZXJ2YWwobWluLG1heClcclxuXHR7XHJcbiAgICBcdHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqKG1heC1taW4rMSkrbWluKTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRGF0YUV4YW1wbGU7Il19
