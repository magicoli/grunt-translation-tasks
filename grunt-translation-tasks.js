const fs   = require( 'fs' );
const path = require( 'path' );

module.exports = function(grunt, pluginName) {

    'use strict';

    // Determine project type and settings
    const isWordPressProject = !!pluginName;
    const pkg = grunt.file.readJSON('package.json');
    const projectName = pluginName || path.basename(pkg.name || 'project');
    
    // Set locale paths based on project type
    const localeFolder = isWordPressProject ? 'languages' : 'locale';
    const localePoFiles = isWordPressProject ? 'languages/*.po' : 'locale/*/LC_MESSAGES/*.po';
    const potPath = isWordPressProject ? 'languages' : 'locale';

    grunt.config.set('addtextdomain', {
        options: {
            textdomain: projectName,
        },
        update_all_domains: {
            options: {
                updateDomains: true
            },
            src: [ '*.php', '**/*.php', '!\.git/**/*', '!bin/**/*', '!node_modules/**/*', '!tests/**/*' ]
        }
    });

    // Custom Task: Make MO Files
    grunt.config.set('makemo', {
        target: {
            files: [{
                expand: true,
                cwd: localeFolder,
                src: isWordPressProject ? ['*.po'] : ['*/LC_MESSAGES/*.po'],
            }]
        }
    });

    grunt.config.set('makepot', {
        target: {
            options: {
                domainPath: '/' + localeFolder,
                exclude: [ '\.git/*', 'bin/*', 'node_modules/*', 'vendor/*', '*/vendor/*', 'tests/*', 'tmp/*', 'dev/*' ],
                mainFile: isWordPressProject ? `${pluginName}.php` : null,
                potFilename: `${projectName}.pot`,
                potHeaders: {
                    poedit: true,
                    'x-poedit-keywordslist': true
                },
                type: isWordPressProject ? 'wp-plugin' : 'generic',
                updateTimestamp: true
            }
        }
    });

    // Only load WP-specific plugins for WordPress projects
    if (isWordPressProject) {
        grunt.loadNpmTasks('grunt-wp-i18n');
    }

    // Register custom tasks
    if (isWordPressProject) {
        grunt.registerTask('i18n', [ 'addtextdomain', 'makepot', 'msgmerge', 'makemo' ]);
        // Register WordPress-specific tasks
        grunt.registerTask('makepot', ['makepot:target']);
        grunt.registerTask('makemo', ['makemo:target']);
    } else {
        grunt.registerTask('i18n', [ 'xgettext', 'msgmerge', 'msgfmt' ]);
        // Register non-WordPress equivalents
        grunt.registerTask('makepot', ['xgettext']);
        grunt.registerTask('makemo', ['msgfmt']);
    }

    grunt.registerTask('xgettext', 'Extract strings using xgettext for non-WordPress projects', function() {
        var done = this.async();
        var potFile = potPath + '/' + projectName + '.pot';
        var phpFiles = grunt.file.expand(['**/*.php', '!node_modules/**', '!vendor/**', '!tests/**', '!dev/**']);
        
        if (!phpFiles.length) {
            grunt.log.error('No PHP files found for extraction');
            return done(false);
        }
        
        grunt.util.spawn({
            cmd: 'xgettext',
            args: [
                '--language=PHP',
                '--keyword=_',
                '--keyword=__',
                '--keyword=_e',
                '--keyword=_c:1,2c',
                '--keyword=_x:1,2c',
                '--keyword=_ex:1,2c',
                '--keyword=_n:1,2',
                '--keyword=_nx:1,2,4c',
                '--keyword=_n_noop:1,2',
                '--keyword=_nx_noop:1,2,3c',
                '--keyword=esc_attr__',
                '--keyword=esc_html__',
                '--keyword=esc_attr_e',
                '--keyword=esc_html_e',
                '--keyword=esc_attr_x:1,2c',
                '--keyword=esc_html_x:1,2c',
                '--from-code=UTF-8',
                '--add-comments=translators',
                '--output=' + potFile
            ].concat(phpFiles)
        }, function(error, result, code) {
            if (error) {
                grunt.log.error('Error running xgettext: ' + error);
                return done(false);
            }
            grunt.log.writeln('Generated POT file: ' + potFile);
            grunt.log.writeln('Extracted strings from ' + phpFiles.length + ' PHP files');
            done();
        });
    });

    grunt.registerTask('msgmerge', 'Update PO files with new POT content', function() {
        var done = this.async();
        var poFiles = grunt.file.expand(localePoFiles);
        var potFile = potPath + '/' + projectName + '.pot';

        if (!grunt.file.exists(potFile)) {
            grunt.log.error('POT file not found: ' + potFile);
            return done(false);
        }

        if (!poFiles.length) {
            grunt.log.writeln('No PO files found - skipping msgmerge');
            return done();
        }

        var completed = 0;
        var hasErrors = false;

        poFiles.forEach(function(poFile) {
            grunt.util.spawn({
                cmd: 'msgmerge',
                args: ['--update', '--backup=off', poFile, potFile]
            }, function(error, result, code) {
                if (error) {
                    grunt.log.error('Error merging ' + poFile + ': ' + error);
                    hasErrors = true;
                } else {
                    grunt.log.writeln('Updated ' + poFile + ' with new strings from POT');
                }
                completed++;
                if (completed === poFiles.length) {
                    done(!hasErrors);
                }
            });
        });
    });

    grunt.registerTask('msgfmt', 'Convert PO files to MO using msgfmt for non-WordPress projects', function() {
        var done = this.async();
        var poFiles = grunt.file.expand(localePoFiles);

        if (!poFiles.length) {
            grunt.log.error('No PO files found');
            return done(false);
        }

        var completed = 0;
        var hasErrors = false;

        poFiles.forEach(function(poFile) {
            var moFile = poFile.replace(/\.po$/, '.mo');
            grunt.util.spawn({
                cmd: 'msgfmt',
                args: ['-o', moFile, poFile]
            }, function(error, result, code) {
                if (error) {
                    grunt.log.error('Error processing ' + poFile + ': ' + error);
                    hasErrors = true;
                } else {
                    grunt.log.writeln('Converted ' + poFile + ' to ' + moFile);
                }
                completed++;
                if (completed === poFiles.length) {
                    done(!hasErrors);
                }
            });
        });
    });

    grunt.registerTask('makemo', 'Convert PO files to MO using WP CLI for WordPress projects', function() {
        var done = this.async();
        var poFiles = grunt.file.expand(localePoFiles);

        if (!poFiles.length) {
            grunt.log.error('No PO files found');
            return done(false);
        }

        var completed = 0;
        poFiles.forEach(function(poFile) {
            grunt.util.spawn({
                cmd: 'wp',
                args: ['i18n', 'make-mo', poFile]
            }, function(error, result, code) {
                if (error) {
                    grunt.log.error('Error processing ' + poFile + ': ' + error);
                    return done(false);
                }
                grunt.log.writeln('Converted ' + poFile);
                completed++;
                if (completed === poFiles.length) {
                    done();
                }
            });
        });
    });

    grunt.util.linefeed = '\n';

};
