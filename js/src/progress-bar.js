class Progressbar{
	/**
	 *
	 */
	constructor($target) {
		this.$target = $target;
	}
	
	update(val){
		this.$target.attr('data-transitiongoal', val).progressbar();
	}
}

module.exports = Progressbar;