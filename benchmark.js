'use strict';
const summary = require('summary');

function timeit(top, callback) {
  const times = new Float64Array(top);
  (function recursive(i) {
    const tick = process.hrtime();
    setImmediate(function () {
      if (i === top) {
        callback(summary(times));
      } else {
        const tock = process.hrtime(tick);
        times[i] = tock[0] * 1e9 + tock[1];

        recursive(i + 1);
      }
    });
  })(0);
}

({
  'master': function () {
    const fork = require('child_process').fork;

    function bench(name, callback) {
      const cp = fork(__filename, [name]);
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

  'baseline': function () {
    const top = 500000;
    timeit(top, function (stat) {
      process.send({ 'mean': stat.mean(), 'sd': stat.sd() });
    });
  },

  'trace': function () {
    require('./trace.js');
    const top = 100000;
    timeit(top, function (stat) {
      process.send({ 'mean': stat.mean(), 'sd': stat.sd() });
    });
  }
})[process.argv[2] || 'master']();
