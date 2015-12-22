'use strict';

const benchmark = require('./time.js');

benchmark({
  baseline: 500000,
  trace: 100000
}, test);

function test(done) {
  setImmediate(done);
}
