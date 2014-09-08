#!/bin/sh
# Get a set of mo files to test with.

wget http://i18n.svn.wordpress.org/ru_RU/trunk/messages/ru_RU.mo

# Also create a non-UTF-8 version to test with.
wget http://i18n.svn.wordpress.org/ru_RU/trunk/messages/ru_RU.po
msgconv --output-file=ru_RU_cp1251.po --to-code=CP1251 ru_RU.po
msgfmt --output-file=ru_RU_cp1251.mo ru_RU_cp1251.po