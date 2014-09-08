'use strict';
if ('undefined' != typeof require) {
    var jed = require('jed');
    var jedGettextParser = require('../jedGettextParser');
    var Promise = require('promise');
}

function load(url) {
    return new Promise(function(resolve, reject){
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
    it('should succeed for a present file', function(done){
        getMOFile('zh_CN').then(function(buffer){
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
            getMOFile('zh_CN').then(function(buffer){
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
            getMOFile('zh_CN').then(function(buffer){
                (function(){
                    /* Cut the end off the file. */
                    buffer = buffer.slice(0, buffer.byteLength - 20);
                    jedGettextParser.mo.parse(buffer);
                }).should.throw('The given ArrayBuffer data is corrupt or incomplete.');
                done();
            }).catch(done);
        })
        it('should succeed for a valid ArrayBuffer', function(done){
            /* This getMOFile is already tested above. */
            getMOFile('zh_CN').then(function(buffer){
                (function(){
                    var locale_data = jedGettextParser.mo.parse(buffer);
                    locale_data.should.be.an.Object;
                    locale_data.should.have.property('messages');
                    locale_data.messages.should.have.property('');
                    locale_data.messages[''].should.have.properties({
                        domain: 'messages',
                        lang: 'zh_CN',
                        plural_forms: 'nplurals=1; plural=0;'
                    });

                    locale_data.messages.should.have.property('Activation Key:', [
                        null,
                        '激活密钥：'
                    ]);

                    locale_data.messages.should.have.property('add new from admin bar\u0004Link', [
                        null,
                        '链接'
                    ]);
                }).should.not.throw();
                done();
            }).catch(done);
        })
    })
})