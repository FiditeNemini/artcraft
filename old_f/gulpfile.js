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
    .pipe(gulp.dest('web/output/'));
}

var buildCss = function() {
  return gulp.src('frontend/old_frontend/css/*.css')
    .pipe(concat('style.css'))
    .pipe(gulp.dest('web/output/'));
}

var buildJs = function() {
  return gulp.src([
      'frontend/old_frontend/js/sentence.js',
      'frontend/old_frontend/js/dictionary.js',
      'frontend/old_frontend/js/sound.js',
      'frontend/old_frontend/js/volume.js',
      'frontend/old_frontend/js/url.js',
      'frontend/old_frontend/js/ui.js',
      'frontend/old_frontend/js/events.js',
      'frontend/old_frontend/js/initialize.js',
    ])
    .pipe(uglify())
    .pipe(concat('script.js'))
    .pipe(gulp.dest('web/output/'));
}

gulp.task('bower', buildLibraries);
gulp.task('js', buildJs);
gulp.task('css', buildCss);

gulp.task('watch', function() {
  gulp.watch(['bower.json', '.bowerrc'], ['bower']);
    watch([ 'frontend/old_frontend/js/*.js' ], buildJs);
    watch([ 'frontend/old_frontend/css/*.css' ], buildCss);
});

gulp.task('build-development', ['bower', 'js', 'css']);
gulp.task('build-production', ['bower', 'js', 'css', 'compress']); // TODO: Compress

gulp.task('default', ['build-development']);

