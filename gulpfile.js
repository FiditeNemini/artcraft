'use strict';

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    filter = require('gulp-filter'),
    mainBowerFiles = require('main-bower-files'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    watch = require('gulp-watch');

var buildLibraries = function() {
  // See https://gist.github.com/ktmud/9384509
  return gulp.src(mainBowerFiles())
    .pipe(filter('**/*.js')) // filter out CSS (bootstrap, etc.)
    .pipe(uglify())
    .pipe(concat('libraries.js'))
    .pipe(gulp.dest('web/'));
}

var buildCss = function() {
  return gulp.src('src/web/css/*.css')
    .pipe(concat('style.css'))
    .pipe(gulp.dest('web/'));
}

var buildJs = function() {
  return gulp.src([
      'src/web/js/dictionary.js',
      'src/web/js/sound.js',
      'src/web/js/url.js',
      'src/web/js/script.js',
    ])
    .pipe(uglify())
    .pipe(concat('script.js'))
    .pipe(gulp.dest('web/'));
}

gulp.task('bower', buildLibraries);
gulp.task('js', buildJs);
gulp.task('css', buildCss);

gulp.task('watch', function() {
  gulp.watch(['bower.json', '.bowerrc'], ['bower']);
    watch([ 'src/web/js/*.js' ], buildJs);
    watch([ 'src/web/css/*.css' ], buildCss);
});

gulp.task('build-development', ['bower', 'js', 'css']);
gulp.task('build-production', ['bower', 'js', 'css', 'compress']); // TODO: Compress

gulp.task('default', ['build-development']);

