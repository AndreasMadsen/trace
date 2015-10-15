'use strict';
require('../../trace.js');

const http = require('http');

//
// test an issue with http where events wheren't removed
//

http.createServer(function (req, res) {
  res.end('ho away :(');
}).listen(0, 'localhost', function listen() {
  const server = this;
  const addr = this.address();

  http.get('http://localhost:' + addr.port, function get(res) {
    res.on('data', function () {});
    res.once('end', function end() {

      server.close(function close() {
        throw new Error('trace');
      });
    });
  });
});
