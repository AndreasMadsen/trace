'use strict';

// We cannot use console.log for debugging because it would call back into our hook
const fs = require('fs');
function debug(msg) {
  fs.writeSync(1, 'trace.js DEBUG ' + msg + '\n');
}

module.exports = {
  debug
};
