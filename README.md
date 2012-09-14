#trace

> Creates super long stack traces

With the help of [async-hook](https://github.com/AndreasMadsen/async-hook) this
module extends all async methods in order to create super long stack traces.

## Installation

```sheel
npm install async-hook
```
## Disclaimer

This has not yet been tested extensively!

## Example

The following script produce an error:

```JavaScript
// active long stack trace
require('trace');

var fs = require('fs');

// There is no limit for the size of the stack trace
Error.stackTraceLimit = Infinity;

setTimeout(function () {
  fs.readFile(__filename, function () {
    process.nextTick(function () {
      throw new Error("custom error");
    });
  });
}, 200);
```

Without the `trace` the error output is:

```
/Users/Andreas/Sites/node_modules/trace/test.js:10
      throw new Error("test");
            ^
Error: test
    at /Users/Andreas/Sites/node_modules/trace/test.js:10:13
    at process.startup.processNextTick.process._tickCallback (node.js:244:9)
```

With the `trace` the error output is:

```
/Users/Andreas/Sites/node_modules/trace/test.js:13
      throw new Error("test");
            ^
Error: test
    at /Users/Andreas/Sites/node_modules/trace/test.js:13:13
    at process.startup.processNextTick.process._tickCallback (node.js:244:9)
    at /Users/Andreas/Sites/node_modules/trace/test.js:12:13
    at fs.readFile (fs.js:176:14)
    at Object.oncomplete (fs.js:297:15)
    at Object.<anonymous> (/Users/Andreas/Sites/node_modules/trace/test.js:11:6)
    at Timer.list.ontimeout (timers.js:101:19)
    at startup.globalTimeouts.global.setTimeout (node.js:169:27)
    at Object.<anonymous> (/Users/Andreas/Sites/node_modules/trace/test.js:10:1)
    at Module._compile (module.js:449:26)
    at Object.Module._extensions..js (module.js:467:10)
    at Module.load (module.js:356:32)
    at Function.Module._load (module.js:312:12)
    at Module.runMain (module.js:492:10)
    at process.startup.processNextTick.process._tickCallback (node.js:244:9)
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
