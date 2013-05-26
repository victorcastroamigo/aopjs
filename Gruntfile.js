module.exports = function (grunt) {

    "use strict";

    grunt.initConfig({

        pkg: grunt.file.readJSON("package.json"),

        jshint: {
            src: {        
                src: ["src/**/*.js"],
                options: {
                    jshintrc: ".jshintrc"
                }
            },
            test: {        
                src: ["test/**/*.js"],
                options: {
                    jshintrc: ".jshintrc"
                }
            }
        },

        qunit: {
            files: ["test/**/*.html"]
        },

        concat: {
            options: {
                separator: ";",
                banner: "/*! <%= pkg.title || pkg.name %> <%= pkg.version %> - (c) <%= grunt.template.today(\"yyyy\") %> <%= pkg.author.name %> - <%= _.pluck(pkg.licenses, \"type\").join(\", \") %> License */\n"
            },
            basic: {
              src: ["src/aop.js"],
              dest: "dist/<%= pkg.name %>-<%= pkg.version %>.js"
            },
            extras: {
              src: ["src/aop.js", "src/jquery-aop.js"],
              dest: 'dist/jquery-<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },

        uglify: {
            options: {
                banner: "/*! <%= pkg.title || pkg.name %> <%= pkg.version %> - (c) <%= grunt.template.today(\"yyyy\") %> <%= pkg.author.name %> - <%= _.pluck(pkg.licenses, \"type\").join(\", \") %> License */\n",
                beautify: {
                    ascii_only: true
                }
            },
            all: {
                files: {
                    "<%= concat.basic.dest %>.min.js": ["<%= concat.basic.dest %>"],                    
                    "<%= concat.extras.dest %>.min.js": ["<%= concat.extras.dest %>"]
                }
            }
        },

        watch: {
            gruntfile: {
                files: "<config:jshint.gruntfile.src>",
                tasks: ["jshint:gruntfile"]
            },
            src: {
                files: "<config:jshint.src.src>",
                tasks: ["jshint:src", "qunit"]
            },
            test: {
                files: "<config:jshint.test.src>",
                tasks: ["jshint:test", "qunit"]
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-qunit");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.registerTask("default", ["jshint", "qunit", "concat", "uglify"]);
    grunt.registerTask("test", ["jshint", "qunit"]);
    grunt.registerTask("travis", ["jshint", "qunit"]);
};
