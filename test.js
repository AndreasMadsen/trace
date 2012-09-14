
// active long stack trace
require('./trace.js');

var fs = require('fs');

// There is no limit for the size of the stack trace
Error.stackTraceLimit = Infinity;

setTimeout(function () {
  fs.readFile(__filename, function () {
    process.nextTick(function () {
      throw new Error("test");
    });
  });
}, 200);
