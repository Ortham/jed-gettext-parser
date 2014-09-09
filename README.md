Jed Gettext Parser
==================

JavaScript Gettext `.mo` file parsing for [Jed](https://github.com/slexaxton/Jed/).

[![Build Status](https://travis-ci.org/WrinklyNinja/jed-gettext-parser.svg?branch=master)](https://travis-ci.org/WrinklyNinja/jed-gettext-parser)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/oliverhamlet.svg)](https://saucelabs.com/u/oliverhamlet)

## Introduction

[Gettext](https://www.gnu.org/software/gettext/) is an old translation standard with implementations in many languages. It's one that localisation-aware programmers and translators are likely to be familiar with.

[Jed](https://github.com/slexaxton/Jed/) provides a very nice interface for translation using Gettext in Javascript.

Jed doesn't supply Gettext translation file parsers, so this library can act as the bridge between Gettext binary files and Jed. Maybe in future it will also gain the ability to parse `.po` files.

*Note: Jed Gettext Parser is made to work with Jed, but is a third-party library. Please direct any support queries to this repository's issue tracker, and [the author](https://github.com/WrinklyNinja).*

## Install

Jed Gettext Parser can be loaded as a browser global, an AMD module, or in Node. It requires support for:

* [Typed Arrays](http://caniuse.com/#feat=typedarrays) ([polyfill](https://github.com/inexorabletash/polyfill/blob/master/typedarray.js))
* Encoding API: Natively supported in Firefox 20 and Chromium 38, and a polyfill is available [here](https://github.com/inexorabletash/text-encoding). For Node, npm will automatically handle the polyfill as a dependency.

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

Jed Gettext Parser isn't yet published, so download and extract its source archive first.

```
npm install ./path/to/jed-gettext-parser
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

There are several Javascript `.po` file parsers available, which can operate in browser or [Node.js](http://nodejs.org/) environments, but the only Javascript `.mo` file parsers that seem to exist are all based off [gettext-parser](https://github.com/andris9/gettext-parser) and so require a Node.js environment, and do not function in the browser.

While developing a [Chromium Embedded Framework](https://code.google.com/p/chromiumembedded)-based application ([LOOT](github.com/loot/loot)) which required localisation of strings in the C++ and the Javascript code, I decided that parsing the `.mo` localisation files in each language separately was the neatest and simplest way of achieving this. Since there didn't seem to be anything that already existed for the task, I wrote this little library.

I used [gettext-parser](https://github.com/andris9/gettext-parser) to cross-check my understanding of the Gettext mo file [spec](https://www.gnu.org/software/gettext/manual/html_node/MO-Files.html), and for some inspiration on this library's API, so many to Andris Reinman for that help.
