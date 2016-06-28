const http = require('http');

http.createServer(function () {
  throw new Error('custom error');
}).listen(1337, function () {
  http.get('http://localhost:1337');
});
