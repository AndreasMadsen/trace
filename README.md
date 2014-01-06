#trace [![Build Status](https://secure.travis-ci.org/AndreasMadsen/trace.png)](http://travis-ci.org/AndreasMadsen/trace)

> Creates super long stack traces

With the help of `AsyncListener` and [stack-chain](https://github.com/AndreasMadsen/stack-chain) this
module will provide stack traces there goes beyond the current tick or turn.

## Installation

```sheel
npm install trace
```

Since version `1.0.0` trace has been rewriten for node 0.11, for previuse node
versions use version `0.2.1` of trace.

## Found a bug?

I encourage you to file any bugs you may find, even if you can't reduce the
issue to only involve nodecore modules. I will then use all my power to fix it.

> I want this module to be the best and most trusted async trace module ever!

## Example

The following script produce an error:

```JavaScript
require('trace'); // active long stack trace
require('clarify'); // Exclude node internal calls from the stack

var fs = require('fs');

// There is no limit for the size of the stack trace (v8 default is 10)
Error.stackTraceLimit = Infinity;

setTimeout(function () {
  fs.readFile(__filename, function () {
    process.nextTick(function () {
      throw new Error("custom error");
    });
  });
}, 200);
```

Without `trace` and [`clarify`](https://github.com/AndreasMadsen/clarify) the output is:

```
/Users/Andreas/Sites/node_modules/trace/example.js:12
      throw new Error("custom error");
            ^
Error: custom error
    at /Users/Andreas/Sites/node_modules/trace/example.js:12:13
    at process._tickCallback (node.js:599:11)
```

With `trace` and [`clarify`](https://github.com/AndreasMadsen/clarify) the output is:

```
/Users/Andreas/Sites/node_modules/trace/example.js:12
      throw new Error("custom error");
            ^
Error: custom error
    at /Users/Andreas/Sites/node_modules/trace/example.js:12:13
    at /Users/Andreas/Sites/node_modules/trace/example.js:11:13
    at null._onTimeout (/Users/Andreas/Sites/node_modules/trace/example.js:10:6)
    at Object.<anonymous> (/Users/Andreas/Sites/node_modules/trace/example.js:9:1)
```

With only `trace` the output is (yes long so use `Error.stackTraceLimit = 25` or something like that).

```
/Users/Andreas/Sites/node_modules/trace/example.js:12
      throw new Error("custom error");
            ^
Error: custom error
    at /Users/Andreas/Sites/node_modules/trace/example.js:12:13
    at process._tickCallback (node.js:599:11)
    at process.nextTick (node.js:625:9)
    at /Users/Andreas/Sites/node_modules/trace/example.js:11:13
    at fs.js:258:14
    at Object.oncomplete (fs.js:97:15)
    at Object.fs.close (fs.js:379:11)
    at close (fs.js:249:8)
    at afterRead (fs.js:239:25)
    at Object.wrapper [as oncomplete] (fs.js:437:17)
    at Object.fs.read (fs.js:440:11)
    at read (fs.js:222:10)
    at fs.js:213:7
    at Object.oncomplete (fs.js:97:15)
    at Object.fs.fstat (fs.js:650:11)
    at fs.js:198:8
    at Object.oncomplete (fs.js:97:15)
    at Object.fs.open (fs.js:401:11)
    at Object.fs.readFile (fs.js:194:6)
    at null._onTimeout (/Users/Andreas/Sites/node_modules/trace/example.js:10:6)
    at Timer.listOnTimeout (timers.js:124:15)
    at Object.exports.active (timers.js:194:5)
    at exports.setTimeout (timers.js:261:11)
    at global.setTimeout (node.js:177:27)
    at Object.<anonymous> (/Users/Andreas/Sites/node_modules/trace/example.js:9:1)
    at Module._compile (module.js:449:26)
    at Object.Module._extensions..js (module.js:467:10)
    at Module.load (module.js:349:32)
    at Function.Module._load (module.js:305:12)
    at Function.Module.runMain (module.js:490:10)
    at startup (node.js:123:16)
    at node.js:1031:3
```

## API documentation

To active require `trace`.

```JavaScript
  require('trace');
```

### Error.stackTraceLimit

The module supports the build in v8
[Error.stackTraceLimit](http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi)
flag.

This is the max depth of the stack trace, by default it is `10`, but it can
be se to any number or `Infinity`.

### Error.captureStackTrace

Not implemented, sugestions are much appreciated
