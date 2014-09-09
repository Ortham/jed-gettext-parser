module.exports = function(grunt) {
    var browsers = [{
        browserName: "firefox",
        version: "31",
        platform: "Windows 7"
    }, {
        browserName: "chrome",
        platform: "Windows 7",
        version: "35"
    }, {
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
        version: "beta"
    }, {
        browserName: "internet explorer",
        platform: "Windows 7",
        version: "10"
    }, {
        browserName: "internet explorer",
        platform: "Windows 7",
        version: "11"
    }, {
        browserName: "safari",
        platform: "OS X 10.9",
        version: "7"
    }, {
        browserName: "iphone",
        platform: "OS X 10.9",
        version: "7.1"
    }, {
        browserName: "android",
        platform: "Linux",
        version: "4.1"
    }, {
        browserName: "android",
        platform: "Linux",
        version: "4.3"
    }, {
        browserName: "android",
        platform: "Linux",
        version: "4.4"
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
    grunt.registerTask("test", ["connect", "saucelabs-mocha"]);
};