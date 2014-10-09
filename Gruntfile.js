/*global module:false*/

module.exports = function (grunt) {

    grunt.initConfig({
        build_hash: +new Date(),
        assets_path: 'assets',
        base_path: '/assets',
        pkg: grunt.file.readJSON('package.json'),

        sass: {
            dist: {
                options: {
                    style: 'compressed'
                },
                files: {
                    '<%= assets_path %>/css/app.css': 'scss/app.scss'
                }
            }
        },

        clean: {
            options: {
                force: true
            },
            files: [
                'assets/*'
            ]
        },

        concat: {
            js: {
                src: [
                    'js/hlf/hlf.js',
                    'js/hlf/hlf.form.js',
                    'js/hlf/hlf.ac.js',
                    'js/hlf/hlf.calendar.js',
                    'js/hlf/hlf.noDates.js',
                    'js/hlf/hlf.guests.js',
                    'js/hlf/hlf.submit.js'
                ],
                dest: 'js/compiled/hlf.js'
            }
        },

        uglify: {
            all: {
                files: {
                    'js/compiled/hlf.min.js': ['js/compiled/hlf.js']
                }
            }
        },

        watch: {
            css: {
                files: [
                    'scss/*.scss'
                ],
                tasks: ['dev']
            },
            js: {
                files: [
                    'js/*.js'
                ],
                tasks: ['dev']
            }
        }

    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.task.registerTask('generate_assets_hash', 'generate YII asets hash', function () {
        var fs = require('fs'),
            crc32 = require('buffer-crc32');
        path = '.',
            stats = fs.statSync(path),
            mtime = stats.mtime.getTime() / 1000,
            hash = crc32(fs.realpathSync(path) + mtime).toString('hex').replace(/^0*/, '')

        grunt.config.set('build_hash', hash);

    });

    grunt.registerTask('css', [
        'sass'
    ]);

    grunt.registerTask('default', [
        'clean',
        'generate_assets_hash',
        'css',
        'concat',
        'uglify'
    ]);

    grunt.registerTask('dev', [
        'clean',
        'generate_assets_hash',
        'css',
        'concat'
    ]);

};
