"use strict";

var gulp = require('gulp'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
    sass = require('gulp-sass'),
cleanCSS = require('gulp-clean-css'),
    maps = require('gulp-sourcemaps'),
  eslint = require('gulp-eslint'),
imagemin = require('gulp-imagemin'),
 connect = require('gulp-connect'),
     del = require('del');


// gulp build to clean, then scripts, styles, images in that order.
gulp.task("build", ['clean', 'scripts', 'styles', 'images'], function() {
	return gulp.src(["index.html", "icons/**"], { base: './'})
            .pipe(gulp.dest('dist'));
});

// gulp default is build
gulp.task("default", ["build"]);

// gulp serve does build and then serve the project
gulp.task('serve', ['build'], function (){
	return connect.server({
		root: 'dist',
		livereload: true
	});
});

// gulp watch, runs scripts when a change is made to any JavaScript and the current page is reloaded 
// runs the entire build first. then watches for a change to our JS.
gulp.task('watch', ['serve'], function () {
  return gulp.watch(['js/**/*.js'], ['scripts', 'html']);
});

gulp.task('html', function() {
	gulp.src('index.html')
	.pipe(connect.reload());
});

// gulp images to optimize the jpeg & png files, then copy to dist/content
gulp.task('images', () => {
    return gulp.src('images/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/content'))
});

gulp.task("concatScripts", function() {
    return gulp.src('js/**/*.js')
    .pipe(maps.init())
    .pipe(concat('app.js'))
    .pipe(maps.write('./'))
    .pipe(gulp.dest('js'));
});

// gulp scripts to concat, minify and copy JS to all.min.js that is copied to dist/scripts. also create source maps
gulp.task("scripts", ['lint', "concatScripts"], function() {
  return gulp.src("js/app.js")
    .pipe(uglify())
    .pipe(rename('app.min.js'))
    .pipe(gulp.dest('dist/scripts'));
});

// gulp styles to compile scss & sass files to css, then conct and minify into all.min.css that is copied to the dist/styles. also create source maps
gulp.task('styles', function() {
  return gulp.src("sass/global.scss")
      .pipe(maps.init())
      .pipe(sass())
      .pipe(cleanCSS())
      .pipe(maps.write('./'))
      .pipe(rename('app.min.css'))
      .pipe(gulp.dest('dist/styles'));
});

// Extra credit.. gulp scripts uses ESLint and sends error messages to the console and halts the build
gulp.task('lint', () => {
    // ESLint ignores files with "node_modules" paths.
    // So, it's best to have gulp ignore the directory as well.
    // Also, Be sure to return the stream from the task;
    // Otherwise, the task may end before the stream has finished.
    return gulp.src(['js/**/*.js','!node_modules/**'])
        // eslint() attaches the lint output to the "eslint" property
        // of the file object so it can be used by other modules.
        .pipe(eslint({
          rules: { "no-console": 1},
        	globals: ['jQuery', '$'],
        	envs: ['browser'] }))
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe(eslint.failAfterError());
});

// gulp clean to delete all files and folders in dist
gulp.task('clean', function() {
  return del(['dist', 'js/app*.js*']);			// delete the dist directory, js/app.js and jp/ap.js.map
});