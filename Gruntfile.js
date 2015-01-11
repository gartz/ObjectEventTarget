module.exports = function(grunt) {

  grunt.initConfig({
    meta: {
      pkg: grunt.file.readJSON('package.json'),
      src: {
        main: 'src/**/*.js',
        test: 'test/specs/**/*.js',
        helper: 'test/helpers/**/*.js',
        polyfill: [
          //'bower_components/WeakMap/WeakMap.js'
        ]
      },
      dist: '<%= meta.pkg.name %>.min.js',
      report: {
        base: 'report',
        coverage: '<%= meta.report.base %>/coverage',
        junit: '<%= meta.report.base %>/junit'
      },
      banner: '//! <%= meta.pkg.title || meta.pkg.name %> - v<%= meta.pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '//<%= meta.pkg.homepage ? "* " + meta.pkg.homepage + "\\n" : "" %>' +
        '//* Copyright (c) <%= grunt.template.today("yyyy") %> <%= meta.pkg.author.name %>;' +
        ' Licensed <%= meta.pkg.license %>\n\n' +
        'var ObjectEventTarget = {options: {VERSION: \'<%= meta.pkg.version %>\'}};\n'
    },
    connect: {
      report: {
        options: {
          open: {
            target: 'http://127.0.0.1:3000',
            appName: 'google-chrome',
            callback: function() {
              grunt.log.writeln('Your browser is open with the report server url.');
              grunt.log.writeln('To close this server press CTRL+C.');
            }
          },
          keepalive: true,
          base: '.',
          port: 3000,
          useAvailablePort: true
        }
      },
      test : {
        options: {
          base: '.',
          port: '?'
        }
      }
    },
    clean: {
      test: [
        '<%= meta.report.base %>'
      ],
      concat: [
        '<%= concat.dist.dest %>'
      ],
      uglify: [
        '<%= meta.dist %>.min.js'
      ]
    },
    concat: {
      options: {
        banner: '<%= meta.banner %>',
        separator: ';'
      },
      dist: {
        src: '<%= meta.src.main %>',
        dest: '<%= meta.pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= meta.banner %>'
      },
      dist: {
        files: {
          '<%= meta.dist %>': ['<%= concat.dist.dest %>']
        }
      }
    },
    jasmine: {
      src: '<%= meta.src.main %>',
      options: {
        specs: '<%= meta.src.test %>',
        helpers: '<%= meta.src.helper %>',
        vendor: '<%= meta.src.polyfill %>',
        junit: {
          path: '<%= meta.report.junit %>'
        }
      },
      coverage: {
        src: '<%= jasmine.src %>',
        options: {
          host: 'http://127.0.0.1:<%= connect.test.options.port %>/',
          template: require('grunt-template-jasmine-istanbul'),
          templateOptions: {
            coverage: '<%= meta.report.coverage %>/coverage.json',
            report: [
              {
                type: 'html',
                options: {
                  dir: '<%= meta.report.coverage %>/html'
                }
              },
              {
                type: 'cobertura',
                options: {
                  dir: '<%= meta.report.coverage %>/cobertura'
                }
              },
              {
                type: 'text-summary'
              }
            ]
          }
        }
      },
      reportUnit: {
        src: '<%= jasmine.src %>',
        options: {
          host: 'http://127.0.0.1:<%= connect.test.options.port %>/',
          outfile: '<%= meta.report.base %>/jasmine.html',
          keepRunner: true,
          junit: {
            path: '<%= jasmine.options.junit.path %>'
          }
        }
      },
      summary: {
        src: '<%= jasmine.src %>',
        options: {
          host: 'http://127.0.0.1:<%= connect.test.options.port %>/',
          template: require('grunt-template-jasmine-istanbul'),
          templateOptions: {
            coverage: '<%= meta.report.coverage %>/coverage.json',
            report: [
              {
                type: 'text-summary'
              }
            ]
          }
        }
      }
    },
    jshint: {
      files: [
        '<%= meta.src.main %>',
      ],
      options: {
        // if you are using CI, this options would be good to be enabled
        //reporter: require('jshint-junit-reporter'),
        //reporterOutput: '<%= meta.report.base %>/jshint.junit.xml',
        camelcase: true,
        curly: false,
        eqeqeq: true,
        es3: false,
        forin: true,
        freeze: false,
        immed: false,
        indent: 2,
        latedef: true,
        newcap: true,
        noarg: true,
        noempty: true,
        nonbsp: true,
        nonew: false,
        plusplus: false,
        quotmark: 'single',
        undef: true,
        unused: true,
        strict: true,
        trailing: true,
        maxparams: 5, // if you need more then 3 use an object param
        maxdepth: 8,
        maxstatements: 40,
        maxlen: 100,
        boss: true,
        browser: true,
        evil: false,
        globals: {
          jQuery: false,
          console: false,
          module: false
        }
      },
      test: {
        src: [
          'Gruntfile.js',
          '<%= meta.src.test %>'
        ],
        options: {
          strict: false,
          maxparams: 4,
          maxdepth: 6,
          maxstatements: 20,
          globals: {
            jQuery: true,
            module: true,
            require: true
          }
        }
      }
    },
    rename: {
      jasmine: {
        files: [
          {src: ['_SpecRunner.html'], dest: '<%= meta.report.base %>/jasmine.html'},
        ]
      }
    },
    'update_json': {
      bower: {
        src: 'package.json',
        dest: 'bower.json',
        fields: [
          'name',
          'version',
          'description',
          'repository'
        ]
      },
      component: {
        src: 'package.json',
        dest: 'component.json',
        fields: {
          'name': null,
          'repository': 'repo',
          'description': null,
          'version': null,
          'keywords': null,
          'main': null,
          'dependencies': null,
          'development': 'devDependencies',
          'license': null
        }
      },
    },
    'merge-json': {
      jshint: {
        src: ['src/.jshintrc', '.jshintrc'],
        dest: '.jshintrc'
      }
    },
    'json_generator': {
      jshintTest: {
        dest: '.jshintrc', // Destination file
        options: '<%= jshint.test.options %>'
      },
      jshintSrc: {
        dest: 'src/.jshintrc', // Destination file
        options: '<%= jshint.options %>'
      }
    },
    watch: {
      files: [
        '<%= meta.src.main %>',
        '<%= meta.src.test %>',
        '<%= meta.src.helper %>',
        'Gruntfile.js'
      ],
      tasks: [
        'update_json',
        'json_generator',
        'merge-json',
        'jshint',
        'connect:test',
        'jasmine:summary'
      ]
    }
  });

  require('load-grunt-tasks')(grunt, {
    pattern: ['grunt-*', '!grunt-template-jasmine-istanbul']
  });

  grunt.registerTask('test', [
    'Run tests and code-coverage then print the summary.'
  ].join(), [
    'jshint',
    'clean:test',
    'connect:test',
    'jasmine:summary'
  ]);

  grunt.registerTask('report', [
    'Open a web-server with coverage report. ',
    'Will open google-chrome if available.'
  ].join(), [
    'clean:test',
    'connect:test',
    'jasmine:reportUnit',
    'jasmine:coverage',
    'connect:report'
  ]);

  grunt.registerTask('default', [
    'update_json',
    'json_generator',
    'merge-json',
    'clean',
    'test',
    'concat',
    'uglify'
  ]);

};
