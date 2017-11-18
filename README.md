# rescue-parachute

[![npm version][npmsemver-image]][npmsemver-url]
[![Code Climate][cq-image]][cq-url]
[![Dependencies][deps-image]][deps-url]
[![Dev Dependencies][dev-deps-image]][dev-deps-url]
[![License][license-image]][license-url]

> rescue-parachute is a graceful exit manager. It is coupled with chorizo logger for my teams ease of use, it may not suit you.

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
npm install --save rescue-parachute
```

## <a name="usage"></a> Usage

See `example.js`.

## <a name="contributing"></a> Contributing and help

### <a name="criticism"></a> Criticism
If you think something could be done better or simply sucks, bring up a issue on the [tracker](https://github.com/fcanela/rescue-parachute/issues). Don't be shy. I really love feedback and technical discussions.

### <a name="developing"></a> Developing
Pull requests are welcome (and will make me cry in joy). I would love it to have tests and make `chorizo` use optional.

Did I already say that I **love** technical discussions? Feel free to open a issue on the [tracker](https://github.com/fcanela/rescue-parachute/issues) if you have any doubt.

### <a name="bugs"></a> Bug reports, feature requests and discussion

Use the [GitHub issue tracker](https://github.com/fcanela/rescue-parachute/issues) to report any bugs or file feature requests. In case you found a bug and have no GitHub account, feel free to email me: fcanela.dev at gmail dot com.

## <a name="license"></a> License

Copyright (c) 2017 Francisco Canela. Licensed under the MIT license.

## <a name="faq"></a> Frequently Asked Questions

### Should I use it in my project?

Probably not. This is tailormade for a project and suitable for breaking changes. I may find a better option and stop maintanig it. Also, the is coupled with "chorizo" logger library.

### Why the hell did you coupled those things? And no tests?

Yes, Robert C. Martin would slap me with a large trout for this.


[npmsemver-image]: https://img.shields.io/badge/version-0.0.0-orange.svg
[npmsemver-url]: https://github.com/fcanela/rescue-parachute
[cq-image]: https://codeclimate.com/github/fcanela/rescue-parachute/badges/gpa.svg
[cq-url]: https://codeclimate.com/github/fcanela/rescue-parachute
[deps-image]: https://david-dm.org/fcanela/rescue-parachute.svg
[deps-url]: https://david-dm.org/fcanela/rescue-parachute
[dev-deps-image]: https://david-dm.org/fcanela/rescue-parachute/dev-status.svg
[dev-deps-url]: https://david-dm.org/fcanela/rescue-parachute#info=devDependencies
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: LICENSE