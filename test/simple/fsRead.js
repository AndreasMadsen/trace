
var test = require("tap").test;
var fs = require('fs');
var produce = require('../produce.js');

// standart async trace modules
require('../../trace.js');

// There is no limit for the size of the stack trace
Error.stackTraceLimit = Infinity;

test("test module method (fs.readFile)", function test(t) {

  fs.readFile(__filename, function callback() {
    // NOTE: that the absolute path has been replaced with a relative path
    //       and that nodecore and tap paths also has been removed
    t.deepEqual(produce(), [
      'Error: trace',
      'at producer (./test/produce.js:16:25)',
      'at callback (./test/simple/fsRead.js:17:17)',
      'at test (./test/simple/fsRead.js:14:6)',
      'at Object.<anonymous> (./test/simple/fsRead.js:12:1)'
    ]);

    t.end();
  });
});
