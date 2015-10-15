'use strict';

const test = require('tap').test;
const produce = require('../produce.js');

// standart async trace modules
require('../../trace.js');

// There is no limit for the size of the stack trace
Error.stackTraceLimit = Infinity;

test('test process method (nextTick)', function test(t) {

  // some async command
  process.nextTick(function callback() {

    // NOTE: that the absolute path has been replaced with a relative path
    //       and that nodecore and tap paths also has been removed
    t.deepEqual(produce(), [
      'Error: trace',
      'at producer (./test/produce.js:16:25)',
      'at callback (./test/simple/nextTick.js:18:17)',
      'at test (./test/simple/nextTick.js:14:11)',
      'at Object.<anonymous> (./test/simple/nextTick.js:11:1)'
    ]);

    t.end();
  });
});
