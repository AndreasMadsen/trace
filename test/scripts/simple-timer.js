'use strict';
require('../../trace.js');

//
// test global method (setTimeout)
//

setTimeout(function callback() {
  throw new Error('trace');
}, 0);
