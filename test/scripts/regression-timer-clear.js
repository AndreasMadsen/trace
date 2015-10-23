'use strict';
require('../../trace.js');

const a = setTimeout(function () {
  throw new Error('setTimeout callback should not be called');
}, 1);

clearTimeout(a);

const b = setInterval(function () {
  throw new Error('setInterval callback should not be called');
}, 1);

clearInterval(b);

const c = setImmediate(function () {
  throw new Error('setImmediate callback should not be called');
});

clearImmediate(c);
