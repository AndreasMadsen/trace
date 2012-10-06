
// active long stack trace
var hook = require('async-hook');
//require('./trace.js');
//require('clarify');

hook.event.attach(function (name, callback) {
  return function () {
    callback.apply(this, arguments);
  };
});
hook.callback.attach(function (name, callback) {
  return function () {
    callback.apply(this, arguments);
  };
});

var http = require('http');

// There is no limit for the size of the stack trace
Error.stackTraceLimit = Infinity;

http.createServer(function (req, res) {
  res.end('ho away :(');
}).listen(0, function () {
  var self = this;
  var addr = this.address();

  http.get('http://' + addr.address + ':' + addr.port, function (res) {

    res.once('end', function () {

      self.close(function () {

        console.log((new Error("http server")).stack);
      });
    });
  });
});
