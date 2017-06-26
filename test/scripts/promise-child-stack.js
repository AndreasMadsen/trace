'use strict';

const p0 = Promise.resolve(1); // will have `scope` in stack trace
const p1 = p0.then(function scopeThrow() {
  console.error(new Error('hello').stack);
});
