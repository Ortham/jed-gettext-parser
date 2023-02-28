// const promise = require('selenium-webdriver');
const express = require('express');
const webdriver = require('selenium-webdriver');
require('should');

webdriver.USE_PROMISE_MANAGER = false;

const port = 9999;
const baseURL = `http://127.0.0.1:${port}/test/browser/index.html`
const sauceOptions = {
    'username': process.env.SAUCE_USERNAME,
    'accessKey': process.env.SAUCE_ACCESS_KEY,
    'build': process.env.BUILD_ID,
    'name': 'mocha browser tests',
    /* As a best practice, set important test metadata and execution options
    such as build info, tags for reporting, and timeout durations.
    */
    'maxDuration': 3600,
    'idleTimeout': 1000,
    'tags': ["master" ]
}

const browsers = [
    /* Internet Explorer */
    {
        platformName: "Windows 10",
        browserName: "internet explorer",
        browserVersion: "11.285"
    },
    /* Edge */
    {
        platformName: "Windows 10",
        browserName: "MicrosoftEdge",
        browserVersion: "14.14393"
    },
    /* Firefox */
    {
        platformName: "Windows 10",
        browserName: "firefox",
        browserVersion: "74.0"
    },
    /* Chrome */
    {
        platformName: "Windows 10",
        browserName: "chrome",
        browserVersion: "80.0"
    }
];

for (const { browserName, browserVersion, platformName } of browsers) {
    describe(`Mocha Browser Tests - ${browserName} ${browserVersion}`, function() {
        let driver;
        let server;

        this.timeout(40000);

        before(async function() {
            const app = express();
            app.use(express.static('.'));
            await new Promise(resolve => {
                server = app.listen(port, resolve);
            });
        });

        after(function(done) {
            server.close(done);
        });

        beforeEach(async function() {
            driver = await new webdriver.Builder().withCapabilities({
                browserName,
                platformName,
                browserVersion,
                'goog:chromeOptions' : { 'w3c' : true },
                'sauce:options': sauceOptions
            }).usingServer("https://ondemand.saucelabs.com/wd/hub").build();

            await driver.getSession().then(function (sessionid) {
                driver.sessionID = sessionid.id_;
            });
        });

        afterEach(async function() {
            await driver.executeScript("sauce:job-result=" + (this.currentTest.state));
            await driver.quit();
        });

        it('should pass all Mocha tests run in the browser', async function() {
            await driver.get(baseURL);
            const failures = await driver.executeAsyncScript(function() {
                var callback = arguments[arguments.length - 1];
                var ranMocha = false;
                function runMocha() {
                    if (!ranMocha) {
                        window.mocha.run(callback);
                        ranMocha = true;
                    }
                }
                window.onload = runMocha;
                if (document.readyState === 'complete') {
                    runMocha();
                }
            });
            failures.should.equal(0);
        });
    });
}
