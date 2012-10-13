
var test = require("tap").test;
var http = require('http');
var produce = require('../produce.js');

// standart async trace modules
require('../../trace.js');

test("test an issue with http where events wheren't removed", function test(t) {

  http.createServer(function (req, res) {
    res.end('ho away :(');
  }).listen(0, function listen() {
    var self = this;
    var addr = this.address();

    http.get('http://' + addr.address + ':' + addr.port, function get(res) {

      res.once('end', function end() {

        self.close(function close() {

          t.deepEqual(produce(), [
            'Error: trace',
            'at producer (./test/produce.js:16:16)',
            'at Server.close (./test/regression/httpClose.js:23:23)',
            'at IncomingMessage.end (./test/regression/httpClose.js:21:14)',
            'at ClientRequest.get (./test/regression/httpClose.js:19:11)',
            'at Server.listen (./test/regression/httpClose.js:17:10)',
            'at Test.test (./test/regression/httpClose.js:13:6)',
            'at Object.<anonymous> (./test/regression/httpClose.js:9:1)'
          ]);
          t.end();
        });
      });
    });
  });
});
