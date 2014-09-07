/* Thanks to the UMD for providing the example for defining an AMD + browser
   global module. */
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals
        root.jedGettextParser = factory();
    }
}(this, function() {
    /* Return what this module exports. */

    function Parser(raw, encoding) {
        this._littleEndian;
        this._dataView = new DataView(raw);
        this._encoding = encoding;

        this._language;
        this._pluralForms;

        this._revision;
        this._stringsCount;
        this._originalOffset;
        this._translationOffset;
    }
    Parser.prototype._MAGIC = 0x950412de;

    Parser.prototype._getEndianness = function() {
        /* MO files can be big or little endian, independent of the source or current platform. Use DataView's optional get*** argument to set the endianness if necessary. */
        if (this._dataView.getUint32(0, true) == this._MAGIC) {
            this._littleEndian = true;
        } else if (this._dataView.getUint32(0, false) == this._MAGIC){
            this._littleEndian = false;
        } else {
            throw Error('Not a gettext binary message catalog file.');
        }
    }

    Parser.prototype._parseHeader = function() {
        /* Read translation header. This is stored as a msgstr where the msgid
           is '', so it's the first entry in the translation block, since
           strings are sorted. */
        var length, position, keyBytes, valueBytes;
        /* Assume that the header is in UTF-8. We only want the language,
           encoding and plural forms values, which should all be ASCII anyway.
           */
        var decoder = new TextDecoder();

        /* Get original byte array, that forms the key. */
        length = this._dataView.getUint32(this._originalOffset, this._littleEndian);
        position = this._dataView.getUint32(this._originalOffset + 4, this._littleEndian);
        keyBytes = new Uint8Array(this._dataView.buffer, position, length);

        /* Get translation byte array, that forms the value. */
        length = this._dataView.getUint32(this._translationOffset, this._littleEndian);
        position = this._dataView.getUint32(this._translationOffset + 4, this._littleEndian);
        valueBytes = new Uint8Array(this._dataView.buffer, position, length);

       if (keyBytes.byteLength == 0) {
            var str = decoder.decode(valueBytes);

            headers = {};
            str.split("\n").forEach(function(line){
                /* Header format is like HTTP headers. */
                var parts = line.split(':');
                var key = parts.shift().trim();
                var value = parts.join(':').trim();
                headers[key] = value;
            });

            /* Get encoding if not given. */
            if (this._encoding == undefined) {
                var pos = headers['Content-Type'].indexOf('charset=');

                if (pos != -1 && pos + 8 < headers['Content-Type'].length) {
                    /* TextDecoder expects a lowercased encoding name. */
                    this._encoding = headers['Content-Type'].substring(pos + 8).toLowerCase();
                }
            }

            /* Get language from header. */
            this._language = headers['Language'];

            /* Get plural forms from header. */
            this._pluralForms = headers['Plural-Forms'];
       }
    }

    Parser.prototype._splitPlurals = function(msgid, msgstr) {
        /* Need to handle plurals. Don't need to handle contexts, because Jed
           expects the context-msgid strings to be its keys. However, plural
           translations must be split into an array of strings. Jed only wants
           the first part of a plural as its key. */
        return {
            id: msgid.split('\u0000')[0],
            str: msgstr.split('\u0000')
        }
    }

    Parser.prototype.parse = function() {
        this._getEndianness();

        /* Get size and offsets. */
        this._revision = this._dataView.getUint32(4, this._littleEndian);
        this._stringsCount = this._dataView.getUint32(8, this._littleEndian);
        this._originalOffset = this._dataView.getUint32(12, this._littleEndian);
        this._translationOffset = this._dataView.getUint32(16, this._littleEndian);

        /* Parse header for info. */
        this._parseHeader();

        /* Create Jed locale_data object. It's incomplete here because the mo
           file doesn't have the domain info. */
        var jedLocaleData = {
            '': {
                'domain': '',
                'lang': this._language,
                'plural_forms': this._pluralForms,
            },
        };

        /* Create a TextDecoder for encoding conversion. */
        var decoder = new TextDecoder(this._encoding);

        /* Now get translations. */
        var originalOffset = this._originalOffset + 8;
        var translationOffset = this._translationOffset + 8;
        var length, position, msgid, msgstr;
        for (var i = 1; i < this._stringsCount; ++i) {
            /* Get original byte array, that forms the key. */
            length = this._dataView.getUint32(originalOffset, this._littleEndian);
            originalOffset += 4;
            position = this._dataView.getUint32(originalOffset, this._littleEndian);
            originalOffset += 4;
            msgid = decoder.decode(new Uint8Array(this._dataView.buffer, position, length));

            /* Get translation byte array, that forms the value. */
            length = this._dataView.getUint32(translationOffset, this._littleEndian);
            translationOffset += 4;
            position = this._dataView.getUint32(translationOffset, this._littleEndian);
            translationOffset += 4;
            msgstr = decoder.decode(new Uint8Array(this._dataView.buffer, position, length));

            var msg = this._splitPlurals(msgid, msgstr);
            jedLocaleData[msg.id] = [ null ].concat(msg.str);
        }

        return jedLocaleData;
    }

    return {

        mo: {
            parse: function(buffer, encoding) {
                var parser = new Parser(buffer, encoding);

                return parser.parse();
            }
        }
    };
}));