> #### NOTE
> 
> This is silly... Use [Browserify][0] or [Webpack][1].

[0]: https://github.com/substack/node-browserify
[1]: https://github.com/webpack/webpack

browser-modules
===============

Implementation of [CommonJS Modules/1.1](http://wiki.commonjs.org/wiki/Modules/1.1)
standard-compliant module loader that runs in modern web browsers.

Goal
----

Project aims at enabling writing portable JavaScript code
that runs on server-side javascript platforms as well as in the browser.
CommonJS way of loading modules was chosen because it's secure, more
user-friendly than asynchronous loading schemes and already implemented
on many platforms (primarily [http://nodejs.org/](nodejs)).

