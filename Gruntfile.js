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

        watch: {
            css: {
                files: [
                    'scss/*.scss'
                ],
                tasks: ['default']
            }
        }

    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');

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
        'css'
    ]);

};
