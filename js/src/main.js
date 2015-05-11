var DataExample = require('./dataExample.js');
var Batch = require('./batch.js');
var ChartLoader = require('./chartLoader.js');

var data = new DataExample(5);
var batch = new Batch(data.getData());

window.onload = () => {
	console.log(batch);
	window.chartLoader = new ChartLoader(batch);
	chartLoader.insertBatch(batch);
}