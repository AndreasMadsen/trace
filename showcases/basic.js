const crypto = require('crypto');
const fs = require('fs');

fs.readFile(__filename, function () {
  crypto.randomBytes(256, function () {
    process.nextTick(function () {
      throw new Error('custom error');
    });
  });
});
