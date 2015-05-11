/**
 * DataExample
 * Generates data for testing purposes
 */
class DataExample {
	constructor(dataPoints) {
		this.dataPoints = dataPoints;
		this.from =  new Date();
		this._data = this.generate();
	}
	
	generate(){
		var len = this.dataPoints;
		var ret = [];
		
		for(var i = 0; i < len; i++){
			var randomDuration = this.randomIntFromInterval(2000, 4000); //Random duration between veneer mats.
			ret.push({
				value: Math.random() * 100,
				timeStamp: randomDuration + this.from.getTime()
			});
		}
		return ret;
	}
	
	getData(){
		return this._data;
	}
	
	randomIntFromInterval(min,max)
	{
    	return Math.floor(Math.random()*(max-min+1)+min);
	}
}

module.exports = DataExample;