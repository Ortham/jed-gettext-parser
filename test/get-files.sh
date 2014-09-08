#!/bin/sh
# Get a set of mo files to test with.

for locale in ru_RU; do
    wget http://i18n.svn.wordpress.org/$locale/trunk/messages/$locale.mo
done