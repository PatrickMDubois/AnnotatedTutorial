var gulp    = require('gulp'),
    plumber = require('gulp-plumber'),
    compass = require('gulp-compass'),
    connect = require('gulp-connect'),
    concat  = require('gulp-concat'),
    gutil   = require('gulp-util'),
    processhtml = require('gulp-processhtml'),
    html2js = require('gulp-html2js');

function onError(err) {
    gutil.beep();
}

gulp.task('connect', function() {
    connect.server({
        root: ['./app', './bower_components'],
        port: 3000,
        livereload: true
    });
});

gulp.task('html', function() {
    gulp.src('./app/*.html')
        .pipe(processhtml({}))
        .pipe(gulp.dest('./dist'))
        .pipe(connect.reload());
});

gulp.task('css', function() {
    gulp.src('./app/sass/main.scss')
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(compass({
            css: './app/css',
            sass: './app/sass'
        }))
        .pipe(gulp.dest('./dist/css'))
        .pipe(connect.reload());
});

gulp.task('app', function() {
    gulp.src([
            './app/scripts/*Helper.js',
            './app/scripts/app.js',
            './app/scripts/*Service.js',
            './app/scripts/*Controller.js',
            './app/scripts/*Directive.js'
        ])
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./dist/scripts'))
        .pipe(connect.reload());
});

gulp.task('images', function() {
    gulp.src('./app/images/**/*.{png,jpg}', {base: './app/images'})
        .pipe(gulp.dest('./dist/images'))
        .pipe(connect.reload());
});

gulp.task('data', function() {
    gulp.src('./app/data/*.json', {base: './app/data'})
        .pipe(gulp.dest('./dist/data'))
        .pipe(connect.reload());
});

gulp.task('dist:dependencies', function() {
    gulp.src([
            './bower_components/modernizr/modernizr.js'
        ], {
            base: './bower_components/modernizr'
        })
        .pipe(gulp.dest('./dist/scripts'));

    gulp.src([
            // list all dependencies here...
            './bower_components/angularjs/angular.js'
        ])
        .pipe(concat('dependencies.js'))
        .pipe(gulp.dest('./dist/scripts'));
});

gulp.task('templates', function() {
    gulp.src('./app/scripts/templates/*.html')
        .pipe(html2js({
            outputModuleName: 'app-templates',
            base: './app/scripts/templates',
            useStrict: true
        }))
        .pipe(concat('templates.js'))
        .pipe(gulp.dest('./app/scripts/templates'))
        .pipe(gulp.dest('./dist/scripts'))
        .pipe(connect.reload());
});

gulp.task('watch', function() {
    gulp.watch('./app/*.html', ['html']);
    gulp.watch('./app/sass/**/*.scss', ['css']);
    gulp.watch('./app/scripts/*.js', ['app']);
    gulp.watch('./app/scripts/templates/*.html', ['templates']);
    gulp.watch('./app/images/**/*.{png,jpg}', ['images']);
    gulp.watch('./app/data/*.json', ['data']);
});

gulp.task('default', ['dist:dependencies', 'connect', 'data', 'images', 'html',
    'css', 'app', 'templates', 'watch']);