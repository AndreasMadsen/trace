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

