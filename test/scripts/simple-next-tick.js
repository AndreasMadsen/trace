'use strict';
require('../../trace.js');

//
// test process method (nextTick)
//

process.nextTick(function callback() {
  throw new Error('trace');
});
