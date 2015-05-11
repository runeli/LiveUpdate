var fs = require("fs");
var browserify = require("browserify");
var babelify = require("babelify");
var gulp = require('gulp');
var watchify = require('watchify');

gulp.task('browserify', function(){
	console.log('watch')
	return watchify(browserify({ debug: true }))
	  .transform(babelify)
	  .require("./js/src/main.js", { entry: true })
	  .bundle()
	  .on("error", function (err) { console.log("Error: " + err.message); })
	  .pipe(fs.createWriteStream("./js/build/bundle.js"));
});
  
gulp.task('watch', function() {
	gulp.watch('./js/src/*.js', ['browserify']);
});