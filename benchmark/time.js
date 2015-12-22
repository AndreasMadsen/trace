'use strict';
const summary = require('summary');

function TimeIt(runs, asyncFn) {
  this.runs = runs;
  this.asyncFn = asyncFn;

  this.times = new Float64Array(runs);
}

TimeIt.prototype._addTimes = function (index, callback) {
  const self = this;
  const tick = process.hrtime();
  this.asyncFn(function (err) {
    const tock = process.hrtime(tick);

    if (err) return callback(err);

    if (index === self.runs) return callback(null);

    self.times[index] = tock[0] * 1e9 + tock[1];
    self._addTimes(index + 1, callback);
  });
}

TimeIt.prototype.run = function (callback) {
  const self = this;
  this._addTimes(0, function (err) {
    if (err) return callback(err);
    callback(null, summary(self.times));
  });
};

const programs = {
  master: function () {
    const fork = require('child_process').fork;

    function bench(name, callback) {
      const cp = fork(process.argv[1], [name]);
      cp.once('message', function (stat) {
          console.log(name + ': ' + stat.mean.toFixed(4) + ' ± ' + (1.96 * stat.sd).toFixed(4) + ' ns/tick');
      });
      cp.once('close', callback);
    }

    bench('baseline', function () {
      bench('trace', function () {
        console.log('done');
      });
    });
  },

  baseline: function (runs, asyncFn) {
    new TimeIt(runs.baseline, asyncFn).run(function (err, stat) {
      if (err) throw err;
      process.send({ 'mean': stat.mean(), 'sd': stat.sd() });
    });
  },

  trace: function (runs, asyncFn) {
    require('../trace.js');
    new TimeIt(runs.baseline, asyncFn).run(function (err, stat) {
      if (err) throw err;
      process.send({ 'mean': stat.mean(), 'sd': stat.sd() });
    });
  }
};


function benchmark(runs, asyncFn) {
  const program = process.argv[2] || 'master';
  programs[program](runs, asyncFn);
}
module.exports = benchmark;
