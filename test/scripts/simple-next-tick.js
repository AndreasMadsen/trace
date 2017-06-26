'use strict';

//
// test process method (nextTick)
//

process.nextTick(function callback() {
  throw new Error('trace');
});
