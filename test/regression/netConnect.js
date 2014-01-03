var test = require("tap").test;
var net = require('net');
var produce = require('../produce.js');

// standart async trace modules
require('../../trace.js');

test("test an issue where there are multiply internal async events", function test(t) {

  var socket = net.connect(24075); // connection refused
  socket.once('error', function (error) {
    t.deepEqual(produce(error), [
      'Error: connect ECONNREFUSED',
      'at Test.test (./test/regression/netConnect.js:10:20)',
      'at Object.<anonymous> (./test/regression/netConnect.js:8:1)'
    ]);
    t.end();
  });
});
