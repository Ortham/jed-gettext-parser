#!/bin/sh
set -e

cd test

msgfmt --output-file=browser/ru_RU.mo ru_RU.po
cp browser/ru_RU.mo ../ru_RU.mo

msgconv --output-file=ru_RU_cp1251.po --to-code=CP1251 ru_RU.po
msgfmt --output-file=browser/ru_RU_cp1251.mo ru_RU_cp1251.po
rm ru_RU_cp1251.po
cp browser/ru_RU_cp1251.mo ../ru_RU_cp1251.mo
