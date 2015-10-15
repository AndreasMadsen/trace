'use strict';

const test = require('tap').test;
const produce = require('../produce.js');

// standart async trace modules
require('../../trace.js');

// There is no limit for the size of the stack trace
Error.stackTraceLimit = Infinity;

test('test global method (setTimeout)', function test(t) {

  // some async command
  setTimeout(function callback() {

    // NOTE: that the absolute path has been replaced with a relative path
    //       and that nodecore and tap paths also has been removed
    t.deepEqual(produce(), [
      'Error: trace',
      'at producer (./test/produce.js:16:25)',
      'at callback (./test/simple/timer.js:18:17)',
      'at test (./test/simple/timer.js:14:3)',
      'at Object.<anonymous> (./test/simple/timer.js:11:1)'
    ]);

    t.end();
  }, 0);
});
