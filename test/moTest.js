'use strict';
if ('undefined' != typeof require) {
    var jed = require('jed');
    var jedGettextParser = require('../jedGettextParser');
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
function getWordPressMOFile(locale) {
    return load('http://i18n.svn.wordpress.org/' + locale + '/trunk/messages/' + locale + '.mo');
}


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
        it("should throw for an ArrayBuffer that doesn't contain a mo file", function(){
            (function(){
                jedGettextParser.mo.parse(new ArrayBuffer(100));
            }).should.throw('Not a gettext binary message catalog file.');
        })
        it("should throw for an ArrayBuffer that is too small to hold an mo file", function(){
            (function(){
                getWordPressMOFile('zh_CN').then(function(buffer){
                    /* MO files have a 28 byte header, so that's an easy check for minimum file size. */
                    buffer = buffer.slice(0, 20);
                    jedGettextParser.mo.parse(buffer);
                });
            }).should.throw('The given ArrayBuffer is too small to hold a valid .mo file.');
        })
        it("should throw for an ArrayBuffer that holds an incomplete mo file", function(){
            (function(){
                getWordPressMOFile('zh_CN').then(function(buffer){
                    /* MO files have a 28 byte header, so that's an easy check for minimum file size. */
                    buffer = buffer.slice(0, buffer.byteLength - 20);
                    jedGettextParser.mo.parse(buffer);
                });
            }).should.throw('The given ArrayBuffer data is corrupt or incomplete.');
        })
    })
})