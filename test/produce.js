
// require nodecore modules
var path = require('path');

// There is no limit for the size of the stack trace
Error.stackTraceLimit = Infinity;

// remove nodecore steps
require('clarify');

// construct filepath there will be searched for in the stacktrace simplifcation
var tapPath = path.dirname(require.resolve('tap'));
var tracePath = path.dirname(require.resolve('../trace'));

module.exports = function producer(error) {
  var stack = (error ||new Error('trace')).stack.split('\n');

  return stack
    .filter(function (line) {
      return line.indexOf(tapPath) === -1;
    })
    .map(function (line) {
      line = line.trim();
      line = line.replace(tracePath, '.');
      return line;
    });
};
