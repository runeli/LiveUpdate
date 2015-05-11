/**
 * ChartLoader
 */
var DataExample = require('./dataExample.js');
var Batch = require('./batch.js');
var Progressbar = require('./progress-bar.js');

class ChartLoader {
	constructor(batch) {
    this.progressbar = new Progressbar($('.progress-bar'));
    this.cumulativeDuration = 0;
    this._constructChart();
  }

  _constructChart(){
    var canvas = document.getElementById('updating-chart'),
    ctx = canvas.getContext('2d'),
    startingData = {
      labels: [1, 2, 3, 4, 5, 6, 7],
      datasets: [
          {
              fillColor: "#EF9A31",
              strokeColor: "#C27E2A",
              pointColor: "#C27E2A",
              pointStrokeColor: "#fff",
              data: [65, 59, 80, 81, 56, 55, 40]
          }
      ]
    };
    this.latestLabel = startingData.labels[6];

  // Reduce the animation steps for demo clarity.
  this.chart = new Chart(ctx).Bar(startingData, {animationSteps: 15});
  }
  
  addData(data){
    this.cumulativeDuration = this.cumulativeDuration + data.untilNext;
    // Add two random numbers for each dataset
    this.chart.addData([data.value], ++this.latestLabel);
    // Remove the first point so we dont just add values forever
    this.chart.removeData();
    this.updateProgresbar();
  }
  
  updateProgresbar(){
    this.progressbar.update((this.cumulativeDuration / this.batch.batchDuration) * 100 );
  }
  
  resetProgressbar(){
    this.cumulativeDuration = 0;
    this.updateProgresbar();
  }
  
  beginUpdate(){
    var nextDataPoint = this.batch.next();
    if(nextDataPoint === undefined){
      this.batchFinished();
    } else {
      this.setUpdateTimer(nextDataPoint);
    }

  }
  
  endUpdate(){
    clearTimeout(this.timerID);
  }
  
  insertBatch(batch){
    this.batch = batch;
    this.latestLabel = 0;
    this.resetProgressbar();
    this.beginUpdate();
  }
  
  //This method should call the server to fetch new data.
	batchFinished(){
    console.log('batch finished, loading a new one');
    this.endUpdate();
    var data = new DataExample(100);
    var batch = new Batch(data.getData());
		this.insertBatch(batch);
	}
  
  setUpdateTimer(data){
    clearTimeout(this.timerID);
    this.timerID = setTimeout(() => {
      this.addData(data);
      this.beginUpdate();
    }, data.untilNext);
    
  }
  
}

module.exports = ChartLoader;