module.exports = function(grunt) {
    /* Test desktop browsers with > 1% usage. */
    var browsers = [
    /* Internet Explorer */
    {
        browserName: "internet explorer",
        platform: "Windows 10",
        version: "11.103"
    },
    /* Edge */
    {
        browserName: "MicrosoftEdge",
        platform: "Windows 10",
        version: "14.14393"
    },
    /* Firefox */
    {
        browserName: "firefox",
        version: "54.0",
        platform: "Windows 10"
    },
    /* Chrome */
    {
        browserName: "chrome",
        platform: "Windows 10",
        version: "59.0"
    },
    /* Safari */
    {
        browserName: "safari",
        platform: "macOS 10.12",
        version: "10.0"
    }];

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
                    throttled: 5,
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
