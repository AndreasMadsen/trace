'use strict';

//
// test global method (setTimeout)
//

setTimeout(function callback() {
  throw new Error('trace');
}, 0);
