	/**
	 * This class handles how a batch behaves. A batch is a set of data, that has been downloaded from a remote server
	 * Class provides methods for getting next items in the queue that contains data
	 */

class Batch {
	constructor(data) {
		this._dataStore = data; //typeof DataEntry
		this.createdOn = new Date();
		this.addUntilNextDuration();
		this.batchDuration = this._batchDuration();
	}
	addUntilNextDuration(){
		this._dataStore.forEach((dataPoint, index) => {
			if(index + 1 != this._dataStore.length){
				dataPoint.untilNext = Math.abs(this._dataStore[index + 1].timeStamp - dataPoint.timeStamp);
			}
		}, this);
	}
	
	_batchDuration(){
		return this._dataStore.reduce((prev, curr) => {
			if(curr.untilNext) {
				return prev + curr.untilNext;
			} else {
				return prev + 0;
			}
		}, 0);
	}
	
	next(){
		return this._dataStore.shift();
	}
	

}

module.exports = Batch;