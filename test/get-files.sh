#!/bin/sh
# Get a set of mo files to test with.

wget http://i18n.svn.wordpress.org/ru_RU/trunk/messages/ru_RU.mo

# Also create a non-UTF-8 version to test with.
wget http://i18n.svn.wordpress.org/ru_RU/trunk/messages/ru_RU.po
msgconv --output-file=ru_RU_cp1251.po --to-code=CP1251 ru_RU.po
msgfmt --output-file=ru_RU_cp1251.mo ru_RU_cp1251.po

# Get Mocha, Jed and should.js for browser tests, since I don't think they'll
# have the browser code in their npm packages.
wget -P test/browser https://raw.githubusercontent.com/shouldjs/should.js/7f7bbe0a104fcbe169d9e4176e6b460ee4b94ec2/should.js
wget -P test/browser https://raw.githubusercontent.com/SlexAxton/Jed/d18499bc7f609720257a9a2e601e3cfe9516db95/jed.js
wget -P test/browser https://raw.githubusercontent.com/visionmedia/mocha/bfb4ec14f0403450e4c6a7ff190eb0596880edcc/mocha.css
wget -P test/browser https://raw.githubusercontent.com/visionmedia/mocha/bfb4ec14f0403450e4c6a7ff190eb0596880edcc/mocha.js

# Also copy gettext files into browser directory.
for file in ru_RU.mo ru_RU.po ru_RU_cp1251.mo ru_RU_cp1251.po; do
    cp $file ./test/browser/$file
done
