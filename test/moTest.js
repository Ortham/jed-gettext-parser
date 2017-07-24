'use strict';
if ('undefined' != typeof require) {
    /* Node */
    var Jed = require('jed');
    var jedGettextParser = require('..');
    var Promise = require('es6-promise').Promise;
    var fs = require('fs');
}

function loadLocalFile(file) {
    if (!file) {
        throw new Error('No locale is given.');
    }
    return new Promise(function(resolve, reject){
        if (typeof XMLHttpRequest != "undefined") {
            /* Browser */
            var xhr = new XMLHttpRequest();
            xhr.open('GET', file);
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
            fs.readFile(file, function(err, data){
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
function shortenBuffer(buffer, newLength) {
    /* IE doesn't support ArrayBuffer.slice()! */
    var outView = new Uint8Array(newLength);
    var inView = new Uint8Array(buffer, 0, newLength);
    for (var i = 0; i < inView.length; ++i) {
        outView[i] = inView[i];
    }
    return outView.buffer;
}

describe('loadLocalFile', function(){
    it('should throw for no argument', function(){
        (function(){
            loadLocalFile();
        }).should.throw('No locale is given.');
    })
    it('should reject for missing file', function(done){
        loadLocalFile('missing.mo').then(function(buffer){
            done(new Error('Function should not have succeeded.'));
        }, function(err){
            done();
        });
    })
    it('should succeed for a present file (ru_RU.mo)', function(done){
        loadLocalFile('ru_RU.mo').then(function(buffer){
            buffer.should.be.an.Object;
            done();
        }, done);
    })
})

describe('mo', function(){
    describe('#parse()', function(){
        describe('invalid input data tests', function(){
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
        })

        describe('mangled input data tests', function(){
            var moArrayBuffer;
            beforeEach(function(done){
                loadLocalFile('ru_RU.mo').then(function(buffer){
                    moArrayBuffer = buffer;
                    done();
                }, done);
            })

            it('should throw for an ArrayBuffer that is too small to hold an mo file', function(){
                (function(){
                    /* MO files have a 28 byte header, so that's an easy check
                       for minimum file size. */
                    moArrayBuffer = shortenBuffer(moArrayBuffer, 20);
                    jedGettextParser.mo.parse(moArrayBuffer);
                }).should.throw('The given ArrayBuffer is too small to hold a valid .mo file.');
            })
            it('should throw for an ArrayBuffer that holds an incomplete mo file', function(){
                (function(){
                    /* Cut the end off the file. */
                    moArrayBuffer = shortenBuffer(moArrayBuffer, moArrayBuffer.byteLength - 20);
                    jedGettextParser.mo.parse(moArrayBuffer);
                }).should.throw('The given ArrayBuffer data is corrupt or incomplete.');
            })
        })

        describe('valid UTF-8 input data tests', function(){
            var moArrayBuffer;
            before(function(done){
                loadLocalFile('ru_RU.mo').then(function(buffer){
                    moArrayBuffer = buffer;
                    done();
                }, done);
            })

            it('should succeed for a valid ArrayBuffer with contexts and plurals', function(){
                (function(){
                    var locale_data = jedGettextParser.mo.parse(moArrayBuffer);
                    locale_data.should.be.an.Object;
                    locale_data.should.have.property('messages');
                    locale_data.messages.should.have.property('');
                    locale_data.messages[''].should.have.properties({
                        domain: 'messages',
                        lang: 'ru_RU',
                        plural_forms: 'nplurals=4; plural=(n==1) ? 0 : (n%10==1 && n%100!=11) ? 3 : ((n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20)) ? 1 : 2);'
                    });

                    locale_data.messages.should.have.property('Manage Comments', [
                        'Управление комментариями'
                    ]);

                    locale_data.messages.should.have.property('admin bar menu group label\u0004Add New', [
                        'Добавить'
                    ]);

                    locale_data.messages.should.have.property('%s comment awaiting moderation', [
                        '%s комментарий ожидает проверки',
                        '%s комментария ожидают проверки',
                        '%s комментариев ожидают проверки',
                        '%s комментарий ожидает проверки'
                    ]);

                }).should.not.throw();
            })
            it('should successfully load under a non-default domain', function(){
                (function(){
                    var opts = {
                        domain: 'ui'
                    };

                    var locale_data = jedGettextParser.mo.parse(moArrayBuffer, opts);
                    locale_data.should.be.an.Object;
                    locale_data.should.have.property('ui');
                    locale_data.ui.should.have.property('');
                    locale_data.ui[''].should.have.properties({
                        domain: 'ui',
                        lang: 'ru_RU',
                        plural_forms: 'nplurals=4; plural=(n==1) ? 0 : (n%10==1 && n%100!=11) ? 3 : ((n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20)) ? 1 : 2);'
                    });

                    locale_data.ui.should.have.property('Manage Comments', [
                        'Управление комментариями'
                    ]);

                }).should.not.throw();
            })
            it('should accept a valid encoding option', function(){
                (function(){
                    var opts = {
                        encoding: 'windows-1252'
                    };

                    var locale_data = jedGettextParser.mo.parse(moArrayBuffer, opts);
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
                        'Ð£Ð¿Ñ€Ð°Ð²Ð»ÐµÐ½Ð¸Ðµ ÐºÐ¾Ð¼Ð¼ÐµÐ½Ñ‚Ð°Ñ€Ð¸ÑÐ¼Ð¸'
                    ]);

                }).should.not.throw();
            })
            it('should throw for an invalid encoding option', function(){
                (function(){
                    var opts = {
                        encoding: 'fake-encoding'
                    };
                    jedGettextParser.mo.parse(moArrayBuffer, opts);

                }).should.throw("The encoding label provided ('fake-encoding') is invalid.");
            })
            it('should provide output accepted by Jed.', function(){
                (function(){
                    var opts = {
                        domain: 'ui'
                    };

                    var locale_data = jedGettextParser.mo.parse(moArrayBuffer, opts);

                    var i18n = new Jed({
                        'locale_data': locale_data,
                        'domain': 'ui'
                    });

                    i18n.gettext('Manage Comments').should.equal('Управление комментариями');

                }).should.not.throw();
            })
        })

        describe('valid non-UTF-8 input data tests', function(){
            var moArrayBuffer;
            before(function(done){
                loadLocalFile('ru_RU_cp1251.mo').then(function(buffer){
                    moArrayBuffer = buffer;
                    done();
                }, done);
            })

            it('should be able to decode mo files encoded in Windows-1251', function(){
                (function(){

                    var locale_data = jedGettextParser.mo.parse(moArrayBuffer);
                    locale_data.should.be.an.Object;
                    locale_data.should.have.property('messages');

                    locale_data.messages.should.have.property('Manage Comments', [
                        'Управление комментариями'
                    ]);

                }).should.not.throw();
            })
        })
    })
})
