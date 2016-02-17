var fs = require('fs');

GLOBAL.BASE_PATH = __dirname;
GLOBAL.SERVICES_PATH = __dirname + '/server/services';
GLOBAL.CONFIG = JSON.parse(fs.readFileSync(BASE_PATH + '/server.config'));

module.exports = function(grunt) {

    grunt.initConfig({
        watch: {
            scripts: {
                files: ['./server/services/references/**/*.json'],
                tasks: ['references']
            },
            options: {
                spawn: false,
            },
        },       
        references: {
            options:{
                dest: './client/js/references',
                translateDest: './server/services/translate',
            }
        },
        dictionary: {
            options: {
                dataFileName: './data/dictionary.txt',
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('references', require('./tasks/references')(grunt));
    grunt.registerTask('dictionary', require('./tasks/dictionary')(grunt));

    grunt.event.on('watch', function(action, filepath) {
        grunt.config("changed_ref_filepath", filepath);
    });

};