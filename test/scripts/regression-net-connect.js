'use strict';
require('../../trace.js');

const net = require('net');

//
// test an issue where there are multiply internal async events
//

const socket = net.connect(24075); // connection refused
socket.once('error', function (error) {
  throw error;
});
