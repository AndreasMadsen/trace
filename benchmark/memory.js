'use strict';

const fs = require('fs');
const path = require('path');
const setInterval = global.setInterval;

function MemoryTracker() {
  this.stream = fs.createWriteStream(
    path.basename(process.argv[1], '.js') + '.csv'
  );
  this.stream.write('"time", "rss", "heapTotal", "heapUsed"\n');
  this.timer = null;
}

MemoryTracker.prototype.start = function () {
  const self = this;
  this.timer = setInterval(function() {
      const time = Date.now();
      const usage = process.memoryUsage();
      self.stream.write(`${time}, ${usage.rss}, ${usage.heapTotal}, ${usage.heapUsed}\n`);
  }, 200);
};

MemoryTracker.prototype.stop = function () {
  clearTimeout(this.timer);
  this.stream.end();
};

module.exports = new MemoryTracker();
