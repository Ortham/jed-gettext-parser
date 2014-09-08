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
                    reject(Error('XHR Error'));
                }
            }
        }, false);
        xhr.send();
    });
};

describe('mo', function(){
    describe('#parse()', function(){
        it('should throw an error for no arguments', function(){
            (function(){
                jedGettextParser.mo.parse();
            }).should.throw();
        })
        it('should throw an error for a non-ArrayBuffer argument', function(){
            (function(){
                jedGettextParser.mo.parse(new String('bad'));
            }).should.throw();
        })
        it("should throw an error for an ArrayBuffer that doesn't contain a mo file", function(){
            (function(){
                jedGettextParser.mo.parse(new ArrayBuffer(100));
            }).should.throw();
        })
        it("should throw an error for an ArrayBuffer that is too small to hold an mo file", function(){
            (function(){
                /* MO files have a 28 byte header, so that's an easy check for minimum file size. */
                var buffer = ArrayBuffer(20);
                jedGettextParser.mo.parse(buffer);
            }).should.throw();
        })
    })
})