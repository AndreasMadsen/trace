'use strict';

const http = require('http');

//
// Test an issue where the async context from HTTP parser isn't correctly
// captured, because MakeCallback is called synchronously.
//

const server = http.createServer(function (req, res) {
  res.end('hallo world');
});

server.listen(0, 'localhost', function () {
  const addr = server.address();
  http.get(`http://${addr.address}:${addr.port}`, function (res) {

    // there is no public endpoint where we lose context. However
    // the internal _read that is called from TCP.onread -> socket.push
    // does lose context.
    // An alternative is also to overwrite res.socket.read, but that
    // is perhaps less public.
    const _read = res.socket._read;
    res.socket._read = function () {
      throw new Error('trace');
      return _read.apply(this, arguments);
    };

    res.resume();
    res.once('end', server.close.bind(server));
  });
});
