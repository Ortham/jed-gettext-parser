const express = require('express');
const webdriver = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
require('should');

const port = 9998;
const baseURL = `http://127.0.0.1:${port}/test/browser/index.html`

const browsersCapabilities = [
    {
        browserName: webdriver.Browser.CHROME
    },
    {
        browserName: webdriver.Browser.FIREFOX,
        'moz:firefoxOptions': {
            binary: firefox.Channel.RELEASE
        }
    }
];

for (const capabilities of browsersCapabilities) {
    describe(`Mocha Browser Tests - ${capabilities.browserName}`, function() {
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
            driver = await new webdriver.Builder()
                .withCapabilities(capabilities)
                .build();

            await driver.getSession().then(function (sessionid) {
                driver.sessionID = sessionid.id_;
            });
        });

        afterEach(async function() {
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
