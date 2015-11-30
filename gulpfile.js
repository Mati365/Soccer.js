var gulp = require("gulp")
  , gutil = require("gulp-util")
  , browserify = require("browserify")
  , babelify = require("babelify")
  , fs = require("fs");

gulp
  /** Build sources to bundle */
  .task("es6", function() {
    browserify({})
      .transform(babelify, { presets: ["es2015"] })
      .require("src/main.js", { entry: true })
      .bundle()
      .on("error", gutil.log)
      .pipe(fs.createWriteStream("dist/app.min.js"));
  })

  /** Watch all source files in directory */
  .task("watch", function() {
    gulp.watch("src/**/*.js", ["es6"]);
  })

  /** Default task */
  .task("default", ["watch"]);
