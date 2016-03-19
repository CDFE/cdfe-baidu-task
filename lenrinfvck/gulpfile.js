//编译less, swig, 打包压缩

"use strict";

var gulp = require("gulp"),
	path = require("path"), //node 模块，非gulp插件
	fs,
	msgErrs = {};

(function() {
	try {
		fs = require("fs-extra");
	} catch (ex) {
		fs = require("fs");
	}
})();


/**
 * 寻找项目根目录
 * @return {String} 项目根目录地址
 */
function findRoot() {
	var dir = process.argv.indexOf("--path"), //node的process模块，argv为shell变量
		i;
	return dir >= 0 ? process.argv[dir + 1] : (function() {
		var paths = [".", "../test"];
		for (i = 0; i < paths.length; i++) {
			dir = paths[i];
			if (fs.existsSync(path.join(dir, "index.html"))) {
				return dir;
			}
		}
		return ".";
	})();
}
/**
 * 设置监听IP
 * @return {String} 监听的IP地址
 */
function readIp() {
	var ip = process.argv.indexOf("--ip"),
		i;
	return ip >= 0 ? process.argv[ip + 1] : false;
}


/**
 * 编译
 */
function complier(opt) {
	var less = require("gulp-less"),
		uglify = require("gulp-uglify"),
		autoprefixer = require("gulp-autoprefixer"),
		minifycss = require("gulp-minify-css"),
		// imagemin = require("gulp-imagemin"),
		rename = require("gulp-rename"),
		// clean = require("gulp-clean"),
		// concat = require("gulp-concat"),
		notify = require("gulp-notify"),
		replace = require("gulp-replace"),
		plumber = require("gulp-plumber"),
		filter = require("gulp-filter"),
		gulpif = require("gulp-if"),
		wraper = require("gulp-wrapper"),
		swig = require("gulp-swig"),
		// livereload = require("gulp-livereload");
		browserSync = require("browser-sync").create(),
		//includer = require("gulp-file-include"),
		sourcemaps = require("gulp-sourcemaps");

	var css = opt.css,
		js = opt.js,
		html = opt.html,
		ip = readIp();

	var util = {
		css: function(files) {
			files
				.pipe(plumber({ //错误处理
					errorHandler: errrHandler
				}))
				.pipe(gulpif(css.filter && css.filter.length, filter(css.filter)))
				.pipe(less())
				.pipe(autoprefixer({
					browsers: ["last 3 version", "ie > 6", "Android >= 3", "Safari >= 5.1", "iOS >= 5"]
				}))
				.pipe(gulpif(opt.debug, minifycss({
					compatibility: "ie6"
				})))
				.pipe(sourcemaps.write(".", {
					sourceRoot: "/" + path.relative(opt.rootPath, opt.css.src).replace(/\\/g, "/") //计算相对路径，win路径转换
				}))
				.pipe(gulp.dest(css.dest))
				.pipe(browserSync.reload({
					stream: true
				})) //browser sync 自动刷新
				.pipe(notify({
					message: "CSS complied!"
				}));
		},
		js: function(files) {
			var modFilter = filter(["**/*.module.js"]), //module筛选，不编译
				jsFilter = filter(["*.js", "!**/*.module.js"]);
			files
				.pipe(plumber({ //错误处理
					errorHandler: errrHandler
				}))
				.pipe(replace(/\r\n?/g, "\n")) //统一换行符
				.pipe(gulpif(!opt.debug, uglify())) //压缩
				.pipe(jsFilter)
				.pipe(gulp.dest(js.dest))
				.pipe(jsFilter.restore())
				.pipe(modFilter)
				.pipe(rename(function(path) {
					path.basename = path.basename.replace(/\.\w+$/, ""); //路径只取文件名并去掉文件类型，转换为文件名
				}))
				.pipe(wraper({
					header: function(file) {
						//seaJs模块补充
						return "(function(f){typeof define===\"function\"?define(f):f()})(function(require,exports,module){";
					},
					footer: "});"
				}))
				.pipe(gulp.dest(js.dest))
				.pipe(notify({
					message: "JS complied！"
				}));
		},
		html: function(files) {
			files
				.pipe(plumber({ //错误处理
					errorHandler: errrHandler
				}))
				.pipe(gulpif(html.filter && html.filter.length, filter(html.filter)))
				//.pipe(includer())
				.pipe(swig({
					defaults: {
						cache: false, //噫。。默认会开启
					}
				}))
				.pipe(gulp.dest(html.dest)).pipe(notify({
					message: "HTML complied！"
				}));
		}
	};

	/*CSS 处理*/
	util.css(gulp.src(css.src + "**/*.less"));

	/*JS 处理*/
	util.js(gulp.src(js.src + "**/*.js"));

	/*HTML 处理*/
	util.html(gulp.src(html.src + "**/*.html"));

	/*监控文件改变*/
	//less
	gulp
		.watch(css.src + "**/*.less", function(files) {
			console.log(files.path);
			util.css(gulp.src(files.path));
		});
	gulp
		.watch(css.src + "**/*.module.less", function(files) {
			console.log(files.path);
			util.css(gulp.src(css.src + "**/*.less"));
		});

	//js
	gulp
		.watch(js.src + "**/*.js", function(files) {
			util.js(gulp.src(files.path));
		});

	//html
	gulp
		.watch(html.src + "**/*.html", function(files) {
			console.log(files.path);
			util.html(gulp.src(html.src + "**/*.html"));
		});

	setTimeout(function() {
		console.log("-------browser sync---------");
		if(ip) {
			browserSync.init({
				proxy: ip
			});
		} else {
			browserSync.init({
				server: {
					baseDir: opt.rootPath,
				},
			});
		}

		gulp.watch([html.dest + "**/*.html", js.dest + "**/*.js"], browserSync.reload);
	}, 200);

}

/**
 * 异常处理
 * @param  {Error} e 错误对象
 */
function errrHandler(e) {
	var msg = e.toString().replace(/\x1B\[\d+m/g, ""),
		msgbox = require("native-msg-box");
	if (!msgErrs[msg]) {
		msgErrs[msg] = msg;
		if (e.plugin === "gulp-less") {
			console.log(JSON.stringify(e, 0, 4).trim() || msg);
		}
		msgbox.prompt({
			msg: msg,
			title: "gulp throw a error"
		}, function() {
			msgErrs[msg] = null;
		});
	}
}

gulp.task("default", function() {
	var root = findRoot();
	complier({
		rootPath: root,
		css: {
			src: path.join(root, "css.src/"),
			dest: path.join(root, "css/"),
			filter: ["**/*.less", "!**/*.module.less"]
		},
		js: {
			src: path.join(root, "js.src/"),
			dest: path.join(root, "js/"),
			filter: ["**/*.js"]
		},
		html: {
			src: path.join(root, "tpl/"),
			dest: path.join(root, ""),
			filter: ["**/*.html", "!**/*.module.html"]
		},
		debug: process.argv.indexOf("--debug") > 0 //调试模式
	});
});