// Requires Gulp v4.
// $ npm uninstall --global gulp gulp-cli
// $ rm /usr/local/share/man/man1/gulp.1
// $ npm install --global gulp-cli
// $ npm install
const { src, dest, watch, series, parallel } = require('gulp');
const browsersync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');

// Compile CSS from Sass.
function buildStyles() {
  return src('scss/styles.scss')
    .pipe(plumbError()) // Global error handler through all pipes.
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7']))
    .pipe(dest('docs/css/'))
    .pipe(browsersync.reload({ stream: true }));
}
 
// Watch changes on all *.scss files and
// trigger buildStyles() at the end.
function watchFiles() {
  watch(
    ['scss/*.scss', 'scss/**/*.scss'],
    { events: 'all', ignoreInitial: false },
    series(buildStyles)
  );
}


// Init BrowserSync.
function browserSync(done) {
  browsersync.init({
    server: {
       baseDir: "./docs",
       index: "/index.html"
    }
  });
  watch(['docs/*.html']).on('change', browsersync.reload)
  done();
}



// Error handler.
function plumbError() {
  return plumber({
    errorHandler: function(err) {
      notify.onError({
        templateOptions: {
          date: new Date()
        },
        title: "Gulp error in " + err.plugin,
        message:  err.formatted
      })(err);
      this.emit('end');
    }
  })
}

// Export commands.
exports.default = parallel(browserSync, watchFiles); // $ gulp
exports.sass = buildStyles; // $ gulp sass
exports.watch = watchFiles; // $ gulp watch
exports.build = series(buildStyles); // $ gulp build
