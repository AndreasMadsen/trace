'use strict';
require('../../trace.js');

const fs = require('fs');

//
// test module method (fs.readFile)
//

fs.readFile(__filename, function callback() {
  throw new Error('trace');
});
