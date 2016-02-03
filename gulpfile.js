'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var merge = require('merge-stream');

var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var browserSync = require('browser-sync').create();

var path = require('path');
var del = require('del');

var jade = require('gulp-jade');

var less = require('gulp-less');
var ghPages = require('gulp-gh-pages');

//
// js
//

var bundler = browserify([ path.join(__dirname, 'src', 'main.js') ]);
var bundle = function () {
    return bundler
        .bundle()
        .on('error', gutil.log)
        .pipe(source('bundle.js'))
        .pipe(gulp.dest(path.join(__dirname, '.tmp')))
        .pipe(browserSync.stream({once: true}));
};

gulp.task('js', bundle);

//
// css
//

gulp.task('css:prism', function () {
    return gulp.src(
        path.join(__dirname, 'node_modules', 'prismjs', 'themes', 'prism.css')
    ).pipe(gulp.dest(path.join(__dirname, '.tmp')));
});




gulp.task('css:less', function () {
    return gulp.src(path.join(__dirname, 'src', 'styles.less'))
        .pipe(less())
        .pipe(gulp.dest(path.join(__dirname, '.tmp')))
        .pipe(browserSync.stream());
});



gulp.task('css', ['css:prism', 'css:less']);


//
// html (jade)
//

gulp.task('jade', function () {
    return gulp.src(path.join(__dirname, 'src', 'index.jade'))
        .pipe(jade())
        .pipe(gulp.dest(path.join(__dirname, '.tmp')))
        .pipe(browserSync.stream());
});

//
// build and dist
//

gulp.task('build', ['js', 'css', 'jade']);

gulp.task('dist', ['build'], function () {
    var staticFiles = gulp.src([
        'src/fonts/**/*',
        'src/images/**/*',
        'src/*.html',
        'src/*.css',
        'src/examples/**/*'
    ], { base: path.join(__dirname, 'src')})
    .pipe(gulp.dest('dist'));

    var builtFiles = gulp.src([ '.tmp/**/*' ]).pipe(gulp.dest('dist'));

    return merge(staticFiles, builtFiles);
});

gulp.task('clean', function () {
    return del(['.tmp', 'dist']);
});

gulp.task('deploy', ['dist'], function () {
    return gulp.src('./dist/**/*')
        .pipe(ghPages());
});


//
// dev mode
//

gulp.task('watch', function () {
    bundler = watchify(browserify([
        path.join(__dirname, 'src', 'main.js')
    ], watchify.args), watchify.args);
    bundler.on('update', bundle);
});

gulp.task('dev', ['watch', 'build'], function () {
    browserSync.init({
        server: ['src', '.tmp']
    });

    gulp.watch('src/**/*.{html,css}').on('change', browserSync.reload);
    gulp.watch('src/**/*.jade', ['jade']);
    gulp.watch('src/**/*.less', ['css:less']);
});

//
// default task
//

gulp.task('default', ['dist']);
