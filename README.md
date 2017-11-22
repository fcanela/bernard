# bernard

[![npm version][npmsemver-image]][npmsemver-url]
[![Build Status][ci-image]][ci-url]
[![Code Climate][cq-image]][cq-url]
[![Dependencies][deps-image]][deps-url]
[![Dev Dependencies][dev-deps-image]][dev-deps-url]
[![License][license-image]][license-url]

> `bernard` is a Node.js graceful exit manager

<img src="/docs/logo.jpg" alt="bernard graceful exit manager for javascript"/>

## Table of Contents

* [Introduction](#introduction)
* [Installing](#installing)
* [Usage](#usage)
* [Contributing and help](#contributing)
    * [Criticism](#criticism)
    * [Developing](#developing)
    * [Bug reports, feature requests and discussion](#contributing)
* [License](#license)
* [Frequently Asked Questions](#faq)


## <a name="introduction"></a> Introduction

Services should exit when asked to or when a no busines logic related error happens. When this happens, chances are the service is still processing some requests. An immediate exit can disrupt this requests and cause (specially in non-transacting environments like microservices) data inconsistencies.

Rescue-parachute helps to stop the execution in an ordered manner. For example, stopping the web server from receiving new requests, then the database connection and finally closing the process.

## <a name="installing"></a> Installing

```
npm install --save bernard
```

## <a name="usage"></a> Usage

Here you have a illustrative example on how to use it with Express:

```js
const express = require('express');
const app = express();
const server = app.listen(9000);

const Bernard = require('bernard');
const bernard = new Bernard();
bernard.prepare();

bernard.addTask({
    title: 'Express Server',
    handler: function() {
        return server.close();
    }
});
```

More examples available in `docs/examples` directory.

## <a name="contributing"></a> Contributing and help

### <a name="criticism"></a> Criticism
If you think something could be done better or simply sucks, bring up a issue on the [tracker](https://github.com/fcanela/bernard/issues). Don't be shy. I really love feedback and technical discussions.

### <a name="developing"></a> Developing
Pull requests are welcome (and will make me cry in joy). Also, did I already say that I **love** technical discussions? Feel free to open a issue on the [tracker](https://github.com/fcanela/bernard/issues) if you have any doubt.

### <a name="bugs"></a> Bug reports, feature requests and discussion

Use the [GitHub issue tracker](https://github.com/fcanela/bernard/issues) to report any bugs or file feature requests. In case you found a bug and have no GitHub account, feel free to email me: fcanela.dev at gmail dot com.

## <a name="license"></a> License

Copyright (c) 2017 Francisco Canela. Licensed under the MIT license.

## <a name="faq"></a> Frequently Asked Questions

### Should I use it in my project?

Probably not. At least, not yet. I usually follow __semver__ for modules versioning and while it is at 0.x.x you can expect breaking changes.

### This project documentation sucks

Yes, I know. Unfortunately I have limited time resources. Feel free to open a issue or sumbit a pull request if you can help me improving this.

### Who draw the Saint Bernard?

I borrowed it from Landis Blair blog, which had copyleft license.


[npmsemver-image]: https://img.shields.io/badge/version-0.0.1-orange.svg
[npmsemver-url]: https://github.com/fcanela/bernard
[ci-image]: https://circleci.com/gh/fcanela/bernard.svg?style=svg
[ci-url]: https://circleci.com/gh/fcanela/bernard
[cq-image]: https://api.codeclimate.com/v1/badges/9961fff740438ec1599b/maintainability
[cq-url]: https://codeclimate.com/github/fcanela/bernard/maintainability
[deps-image]: https://david-dm.org/fcanela/bernard.svg
[deps-url]: https://david-dm.org/fcanela/bernard
[dev-deps-image]: https://david-dm.org/fcanela/bernard/dev-status.svg
[dev-deps-url]: https://david-dm.org/fcanela/bernard#info=devDependencies
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: LICENSE
