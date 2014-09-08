'use strict';
if ('undefined' != typeof require) {
    /* Node */
    var Jed = require('jed');
    var jedGettextParser = require('../jedGettextParser');
    var Promise = require('promise');
    var fs = require('fs');
}

function load(url) {
    return new Promise(function(resolve, reject){
        if (typeof XMLHttpRequest != "undefined") {
            /* Browser */
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.responseType = 'arraybuffer';
            xhr.addEventListener('readystatechange', function(evt){
                if (evt.target.readyState == 4) {
                    /* Status is 0 for local file URL loading. */
                    if (evt.target.status == 0 || evt.target.status >= 200 && evt.target.status < 400) {
                        resolve(evt.target.response);
                    } else {
                        reject(new Error('XHR Error'));
                    }
                }
            }, false);
            xhr.send();
        } else {
            fs.readFile(url, function(err, data){
                if (err) {
                    reject(err);
                } else {
                    /* Convert to an ArrayBuffer */
                    var aBuf = new ArrayBuffer(data.length);
                    var view = new Uint8Array(aBuf);
                    for (var i = 0; i < data.length; ++i) {
                        view[i] = data[i];
                    }
                    resolve(aBuf);
                }
            });
        }
    });
};
function getMOFile(locale) {
    if (!locale) {
        throw new Error('No locale is given.');
    }
    return load(locale + '.mo');
}

describe('getMOFile', function(){
    it('should throw for no argument', function(){
        (function(){
            getMOFile();
        }).should.throw('No locale is given.');
    })
    it('should reject for missing file', function(done){
        getMOFile('missing').then(function(buffer){
            done(new Error('Function should not have succeeded.'));
        }).catch(function(err){
            done();
        });
    })
    it('should succeed for a present file (ru_RU)', function(done){
        getMOFile('ru_RU').then(function(buffer){
            buffer.should.be.an.Object;
            done();
        }).catch(function(err){
            done(err);
        })
    })
})

describe('mo', function(){
    describe('#parse()', function(){
        it('should throw for no arguments', function(){
            (function(){
                jedGettextParser.mo.parse();
            }).should.throw('First argument must be an ArrayBuffer.');
        })
        it('should throw for a non-ArrayBuffer argument', function(){
            (function(){
                jedGettextParser.mo.parse(new String('bad'));
            }).should.throw('First argument must be an ArrayBuffer.');
        })
        it('should throw for an empty ArrayBuffer', function(){
            (function(){
                jedGettextParser.mo.parse(new ArrayBuffer(0));
            }).should.throw('Given ArrayBuffer is empty.');
        })
        it('should throw for an ArrayBuffer that does not contain a mo file', function(){
            (function(){
                jedGettextParser.mo.parse(new ArrayBuffer(100));
            }).should.throw('Not a gettext binary message catalog file.');
        })
        it('should throw for an ArrayBuffer that is too small to hold an mo file', function(done){
            /* This getMOFile is already tested above. */
            getMOFile('ru_RU').then(function(buffer){
                (function(){
                    /* MO files have a 28 byte header, so that's an easy check for minimum file size. */
                    buffer = buffer.slice(0, 20);
                    jedGettextParser.mo.parse(buffer);
                }).should.throw('The given ArrayBuffer is too small to hold a valid .mo file.');
                done();
            }).catch(done);
        })
        it('should throw for an ArrayBuffer that holds an incomplete mo file', function(done){
            /* This getMOFile is already tested above. */
            getMOFile('ru_RU').then(function(buffer){
                (function(){
                    /* Cut the end off the file. */
                    buffer = buffer.slice(0, buffer.byteLength - 20);
                    jedGettextParser.mo.parse(buffer);
                }).should.throw('The given ArrayBuffer data is corrupt or incomplete.');
                done();
            }).catch(done);
        })

        it('should succeed for a valid ArrayBuffer with contexts and plurals', function(done){
            /* This getMOFile is already tested above. */
            getMOFile('ru_RU').then(function(buffer){
                (function(){
                    var locale_data = jedGettextParser.mo.parse(buffer);
                    locale_data.should.be.an.Object;
                    locale_data.should.have.property('messages');
                    locale_data.messages.should.have.property('');
                    locale_data.messages[''].should.have.properties({
                        domain: 'messages',
                        lang: 'ru_RU',
                        plural_forms: 'nplurals=4; plural=(n==1) ? 0 : (n%10==1 && n%100!=11) ? 3 : ((n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20)) ? 1 : 2);'
                    });

                    locale_data.messages.should.have.property('Manage Comments', [
                        null,
                        'Управление комментариями'
                    ]);

                    locale_data.messages.should.have.property('admin bar menu group label\u0004Add New', [
                        null,
                        'Добавить'
                    ]);

                    locale_data.messages.should.have.property('%s comment awaiting moderation', [
                        null,
                        '%s комментарий ожидает проверки',
                        '%s комментария ожидают проверки',
                        '%s комментариев ожидают проверки',
                        '%s комментарий ожидает проверки'
                    ]);

                }).should.not.throw();
                done();
            }).catch(done);
        })
        it('should successfully load under a non-default domain', function(done){
            getMOFile('ru_RU').then(function(buffer){
                (function(){
                    var opts = {
                        domain: 'ui'
                    };

                    var locale_data = jedGettextParser.mo.parse(buffer, opts);
                    locale_data.should.be.an.Object;
                    locale_data.should.have.property('ui');
                    locale_data.ui.should.have.property('');
                    locale_data.ui[''].should.have.properties({
                        domain: 'ui',
                        lang: 'ru_RU',
                        plural_forms: 'nplurals=4; plural=(n==1) ? 0 : (n%10==1 && n%100!=11) ? 3 : ((n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20)) ? 1 : 2);'
                    });

                    locale_data.ui.should.have.property('Manage Comments', [
                        null,
                        'Управление комментариями'
                    ]);

                }).should.not.throw();
                done();
            }).catch(done);
        })
        it('should accept a valid encoding option', function(done){
            getMOFile('ru_RU').then(function(buffer){
                (function(){
                    var opts = {
                        encoding: 'windows-1252'
                    };

                    var locale_data = jedGettextParser.mo.parse(buffer, opts);
                    locale_data.should.be.an.Object;
                    locale_data.should.have.property('messages');
                    locale_data.messages.should.have.property('');
                    locale_data.messages[''].should.have.properties({
                        domain: 'messages',
                        lang: 'ru_RU',
                        plural_forms: 'nplurals=4; plural=(n==1) ? 0 : (n%10==1 && n%100!=11) ? 3 : ((n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20)) ? 1 : 2);'
                    });

                    /* String gets mangled because it's the wrong encoding. */
                    locale_data.messages.should.have.property('Manage Comments', [
                        null,
                        'Ð£Ð¿Ñ€Ð°Ð²Ð»ÐµÐ½Ð¸Ðµ ÐºÐ¾Ð¼Ð¼ÐµÐ½Ñ‚Ð°Ñ€Ð¸ÑÐ¼Ð¸'
                    ]);

                }).should.not.throw();
                done();
            }).catch(done);
        })
        it('should throw for an invalid encoding option', function(done){
            getMOFile('ru_RU').then(function(buffer){
                (function(){
                    var opts = {
                        encoding: 'fake-encoding'
                    };

                    var locale_data = jedGettextParser.mo.parse(buffer, opts);

                }).should.throw("The encoding label provided ('fake-encoding') is invalid.");
                done();
            }).catch(done);
        })
        it('should be able to decode mo files encoded in Windows-1251', function(done){
            getMOFile('ru_RU_cp1251').then(function(buffer){
                (function(){

                    var locale_data = jedGettextParser.mo.parse(buffer);
                    locale_data.should.be.an.Object;
                    locale_data.should.have.property('messages');

                    locale_data.messages.should.have.property('Manage Comments', [
                        null,
                        'Управление комментариями'
                    ]);

                }).should.not.throw();
                done();
            }).catch(done);
        })
        it('should provide output accepted by Jed.', function(done){
            getMOFile('ru_RU').then(function(buffer){
                (function(){
                    var opts = {
                        domain: 'ui'
                    };

                    var locale_data = jedGettextParser.mo.parse(buffer, opts);

                    var i18n = new Jed({
                        'locale_data': locale_data,
                        'domain': 'ui'
                    });

                    i18n.gettext('Manage Comments').should.equal('Управление комментариями');

                }).should.not.throw();
                done();
            }).catch(done);
        })
    })
})