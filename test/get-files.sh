#!/bin/sh
# Get an mo file to test with.
wget http://i18n.svn.wordpress.org/ru_RU/trunk/messages/ru_RU.mo

# Also create a non-UTF-8 version to test with.
wget http://i18n.svn.wordpress.org/ru_RU/trunk/messages/ru_RU.po
msgconv --output-file=ru_RU_cp1251.po --to-code=CP1251 ru_RU.po
msgfmt --output-file=ru_RU_cp1251.mo ru_RU_cp1251.po
rm ru_RU.po ru_RU_cp1251.po

# Also copy gettext files into browser directory.
for file in ru_RU.mo ru_RU_cp1251.mo; do
    cp $file ./test/browser/$file
done

# Get Mocha, Jed, should.js and Encoding API and Promises polyfills for browser
# tests.
wget -P test/browser https://raw.githubusercontent.com/shouldjs/should.js/4.0.4/should.min.js
wget -P test/browser https://raw.githubusercontent.com/SlexAxton/Jed/1.1.0/jed.js
wget -P test/browser https://raw.githubusercontent.com/inexorabletash/text-encoding/v0.1.0/lib/encoding.js
wget -P test/browser https://raw.githubusercontent.com/inexorabletash/text-encoding/v0.1.0/lib/encoding-indexes.js
wget -P test/browser http://s3.amazonaws.com/es6-promises/promise-1.0.0.min.js
wget -P test/browser https://raw.githubusercontent.com/visionmedia/mocha/1.21.4/mocha.css
wget -P test/browser https://raw.githubusercontent.com/visionmedia/mocha/1.21.4/mocha.js
