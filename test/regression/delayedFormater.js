
var test = require('tap').test;
var produce = require('../produce.js');

// standart async trace modules
require('../../trace.js');

test("set Error.prepearStackTrace", function test(t) {
  Error.prepareStackTrace = function (error, frames) {
    var lines = [ error.toString() ];
    for (var i = 0; i < frames.length; i++) {
      lines.push('    at-hack ' + frames[i].toString());
    }
    return lines.join('\n');
  };

  // Do something async-like
  // Before fix this would result in a
  // Cannot read property 'slice' of undefined
  process.stdout.write('');

  // Try getting a stack trace
  t.deepEqual(produce(), [
    'Error: trace',
    'at-hack producer (./test/produce.js:16:25)',
    'at-hack test (./test/regression/delayedFormater.js:23:15)',
    'at-hack Object.<anonymous> (./test/regression/delayedFormater.js:8:1)'
  ]);

  t.end();
});
