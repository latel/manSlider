module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        concat: {
            uncompressed: {
                files: {
                    "dist/<%= pkg.name %>-<%= pkg.version %>.js": "lib/manSlider.js",
                    "dist/<%= pkg.name %>-packed-<%= pkg.version %>.js": ["test/js/LocalEvent.js", "lib/manSlider.js"]
                }
            }
        },
        uglify: {
            options: {
                banner: "/*! <%= pkg.name %>-<%= pkg.version %>.min.js, <%= grunt.template.today('yyyy/mm/dd') %>*/\n\n"
            },
            compress: {
                files: {
                    "dist/<%= pkg.name %>-<%= pkg.version %>.min.js": "dist/<%= pkg.name %>-<%= pkg.version %>.js",
                    "dist/<%= pkg.name %>-packed-<%= pkg.version %>.min.js": "dist/<%= pkg.name %>-packed-<%= pkg.version %>.js"
                }
            }
        },
        jshint: {
            options: {
                curly: true, 
                newcap: true,
                noarg: true,
                undef: true,
                boss: true,
                strict: true,
                white: true,
                jquery: true,
                browser: true
            },
            files: ['src/js/matrix.js', 'src/js/LocalEvent.js']
        },
        watch: {
            options: {
                spawn: false,
                livereload: {
                    port: 9000
                }
            },
            scripts: {
                files: ["lib/manSlider.js", "test/index.html"],
                tasks: ["concat", "uglify"]
            },
            styles: {
                files: ["lib/manSlider.css"],
                tasks: ["cssmin"]
            }
        },
        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    paths: 'lib/',
                    themedir: 'node_modules/grunt-contrib-yuidoc/node_modules/yuidocjs/themes/simple/',
                    outdir: 'docs/'
                }
            }
        },
        cssmin: {
            compress: {
                files: {
                    "dist/<%= pkg.name %>.css": "lib/manSlider.css"
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-yuidoc");
    grunt.loadNpmTasks("grunt-contrib-cssmin");

    grunt.registerTask("default", ["concat", "uglify"]);
    grunt.registerTask("check", ["jshint"]);
    grunt.registerTask("makedoc", ["yuidoc"]);
    grunt.registerTask("pack", ["concat"]);
};
