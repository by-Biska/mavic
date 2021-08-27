const { src, dest, watch, parallel, series } = require("gulp");

const scss = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const browserSync = require("browser-sync").create();
const uglify = require("gulp-uglify-es").default;
const autoprefixer = require("gulp-autoprefixer");
const imagemin = require("gulp-imagemin");
const del = require("del");
const webp = require("gulp-webp"); 
const webphtml = require("gulp-webp-html");
const webpcss = require("gulp-webpcss");

function browsersync() {
  browserSync.init({
    server: {
      baseDir: "app/",
    },
    port: 3000,
    notify: false,
  });
}

function cleanDist() {
  return del("dist");
}

function images() {
  return src("app/images/**/*")
    .pipe(
      webp({
        quality: 70,
      })
    )
    .pipe(dest("dist/images"))
    .pipe(src("app/images/**/*"))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(dest("dist/images"));
}

function scripts() {
  return src([
    "node_modules/jquery/dist/jquery.js",
    "node_modules/slick-carousel/slick/slick.js",
    "node_modules/fullpage.js/dist/fullpage.js",
    "app/js/main.js"])
    .pipe(concat("main.min.js"))
    .pipe(uglify())
    .pipe(dest("app/js"))
    .pipe(browserSync.stream());
}

function html() {
  return src(["app/index.html"])
  .pipe(webphtml())
  .pipe(dest("dist/"))
}

function styles() {
  return src("app/scss/style.scss")
    .pipe(
      scss({
        outputStyle: "compressed",
      })
    )
    .pipe(concat("style.min.css"))

    .pipe(dest("app/css"))
    .pipe(browserSync.stream());
}

function build() {
  return src(
    [
      "app/css/style.css",
      "app/css/style.min.css",
      "app/fonts/**/*",
      "app/js/main.min.js",
    ],
    { base: "app" }
  ).pipe(dest("dist"));
}

function watching() {
  watch(["app/scss/**/*.scss"], styles);
  watch(["app/js/**/*.js", "!app/js/main.min.js"], scripts);
  watch(["app/*.html"]).on('change', browserSync.reload);
}

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.cleanDist = cleanDist;
exports.html = html;

exports.build = series(cleanDist, images, html, build);
exports.default = parallel(styles, scripts, browsersync, watching);
