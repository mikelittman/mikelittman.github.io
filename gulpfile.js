var gulp        = require('gulp'),
    browserSync = require('browser-sync')
    ;


gulp.task('serve', function(){
    browserSync({
        open: false,
        server: {
            baseDir: "./"
        }
    });
});
