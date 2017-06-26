'use strict';

const net = require('net');

const server = net.createServer(function (socket) {
  throw new Error('trace');
});

server.listen(0, 'localhost', function () {
  const addr = server.address();
  const socket = net.connect(addr.port, addr.address, function () {
    // just hang, it will throw
  });
});
