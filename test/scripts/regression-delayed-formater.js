'use strict';
require('../../trace.js');

Error.prepareStackTrace = function (error, frames) {
  const lines = [ error.toString() ];
  for (let i = 0; i < frames.length; i++) {
    lines.push('    at-hack ' + frames[i].toString());
  }
  return lines.join('\n');
};

// Do something async-like
// Before fix this would result in a
// Cannot read property 'slice' of undefined
process.stdout.write('');

// Try getting a stack trace
throw new Error('trace');
