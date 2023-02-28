Jed Gettext Parser
==================

JavaScript Gettext `.mo` file parsing for [Jed](https://github.com/slexaxton/Jed/).

![CI](https://github.com/Ortham/jed-gettext-parser/workflows/CI/badge.svg?branch=master&event=push)
[![Sauce Test Status](https://saucelabs.com/browser-matrix/oliverhamlet.svg)](https://saucelabs.com/u/oliverhamlet)

## Introduction

[Gettext](https://www.gnu.org/software/gettext/) is an old translation standard with implementations in many languages. It's one that localisation-aware programmers and translators are likely to be familiar with.

[Jed](https://github.com/slexaxton/Jed/) provides a very nice interface for translation using Gettext in Javascript.

Jed doesn't supply Gettext translation file parsers, so this library can act as the bridge between Gettext binary files and Jed.

*Note: Jed Gettext Parser is made to work with Jed, but is a third-party library. Please direct any support queries to this repository's issue tracker, and [the author](https://github.com/Ortham).*

## Install

Jed Gettext Parser can be loaded as a browser global, an AMD module, or in Node. It requires support for:

* [Typed Arrays](http://caniuse.com/#feat=typedarrays) ([polyfill](https://github.com/inexorabletash/polyfill/blob/master/typedarray.js))
* [Encoding API](http://caniuse.com/#feat=textencoder) ([polyfill](https://github.com/inexorabletash/text-encoding))

Node supports Typed Arrays, and npm will automatically handle the Encoding API polyfill as a dependency.

##### Browser Global

```
<script src="jedGettextParser.js"></script>
<script>
// Use jedGettextParser
</script>
```

##### AMD Module

```
require(['jedGettextParser'], function(jedGettextParser) {
    // Use jedGettextParser
});
```

##### Node

```
npm install jed-gettext-parser
```

```
var jedGettextParser = require('jed-gettext-parser');
// Use jedGettextParser
```

## Usage

Once you've loaded Jed and Jed Gettext Parser, they can can be used together:

```
var moBuffer = new ArrayBuffer();
// Fill the moBuffer with the contents of a .mo file in whatever way you like.

// locale_data is an object holding locale data as expected by Jed.
var locale_data = jedGettextParser.mo.parse(moBuffer);

// Now load using Jed.
var i18n = new Jed({
    'locale_data': locale_data,
    'domain': 'messages'
});
```

#### API

The library currently exposes only one function:

```
var data = jedGettextParser.mo.parse(buffer[, options]);
```

* `data`: an object that can be used as the value of Jed's `locale_data` initialisation option.
* `buffer`: an `ArrayBuffer` object that holds the contents of the `.mo` file to parse.
* `options`: an object that can be optionally provided to specify some settings.

The `options` object has the following structure (default values given):

```
var options = {
    encoding: undefined,
    domain: 'messages'
}
```

* `encoding`: The encoding to use when reading the `.mo` file. If undefined, the encoding given in the `.mo` file will be used. Otherwise, valid values are those given in the [Encoding API specification](http://encoding.spec.whatwg.org/#names-and-labels).
* `domain`: The domain under which the translation data should be stored.

If an issue is encountered during parsing, an `Error` object describing the problem will be thrown.

## Motivation

There are two types of Gettext translation files: the `.po` files contain human-readable text that can be easily edited by translators, and the `.mo` files contain equivalent binary data. Some Gettext implementations use one, the other, or both.

While developing a [Chromium Embedded Framework](https://code.google.com/p/chromiumembedded)-based application ([LOOT](github.com/loot/loot)) which required localisation of strings in the C++ and the Javascript code, I decided that parsing the `.mo` localisation files in each language separately was the neatest and simplest way of achieving this. The only Javascript `.mo` file parser I could find was [gettext-parser](https://github.com/andris9/gettext-parser), and it's Node-only, so I wrote this little library.

I used [gettext-parser](https://github.com/andris9/gettext-parser) to cross-check my understanding of the Gettext mo file [spec](https://www.gnu.org/software/gettext/manual/html_node/MO-Files.html), and as inspiration for this library's API, so thanks to Andris Reinman for writing it.
