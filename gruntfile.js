module.exports = function(grunt) {
    /* Test browsers with > 1% usage. */
    var browsers = [
    /* Internet Explorer.
       8 and 9 don't work for some reason, can't tell why. */
    {
        browserName: "internet explorer",
        platform: "Windows 7",
        version: "10"
    }, {
        browserName: "internet explorer",
        platform: "Windows 7",
        version: "11"
    },
    /* Firefox */
    {
        browserName: "firefox",
        version: "32",
        platform: "Windows 7"
    }, {
        browserName: "firefox",
        version: "33",
        platform: "Windows 7"
    },
    /* Chrome */
    {
        browserName: "chrome",
        platform: "Windows 7",
        version: "36"
    }, {
        browserName: "chrome",
        platform: "Windows 7",
        version: "37"
    }, {
        browserName: "chrome",
        platform: "Windows 7",
        version: "38"
    },
    /* iOS */
    {
        browserName: "iphone",
        platform: "OS X 10.9",
        version: "7.1"
    }, {
        browserName: "iphone",
        platform: "OS X 10.9",
        version: "8"
    }, {
        browserName: "iphone",
        platform: "OS X 10.9",
        version: "8.1"
    },
    /* Android.
       4.3 and 4.4 don't work for some reason, the tests themselves pass, but the process just completes with no pass or fail. */
    {
        browserName: "android",
        platform: "Linux",
        version: "4.1"
    }/*, {
        browserName: "android",
        platform: "Linux",
        version: "4.3"
    }, {
        browserName: "android",
        platform: "Linux",
        version: "4.4"
    }*/];

    grunt.initConfig({
        connect: {
            server: {
                options: {
                    base: "",
                    port: 9999
                }
            }
        },
        mochaTest: {
            test: {
                options: {
                    require: 'should',
                    ui: 'bdd',
                    mocha: require('mocha'),
                    clearRequireCache: true
                },
                src: ['test/moTest.js']
            }
        },
        'saucelabs-mocha': {
            all: {
                options: {
                    urls: ["http://127.0.0.1:9999/test/browser/index.html"],
                    build: process.env.TRAVIS_JOB_ID,
                    throttled: 3,
                    browsers: browsers,
                    testname: "mocha tests",
                    tags: ["master"]
                }
            }
        },
        watch: {}
    });

    // Loading dependencies
    for (var key in grunt.file.readJSON("package.json").devDependencies) {
        if (key !== "grunt" && key.indexOf("grunt") === 0) grunt.loadNpmTasks(key);
    }

    grunt.registerTask("dev", ["connect", "watch"]);
    grunt.registerTask("test", ["mochaTest", "connect", "saucelabs-mocha"]);
};
