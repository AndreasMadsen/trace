
var summary = require('summary');

function timeit(top, callback) {
    var times = new Float64Array(1000000);
    (function recursive(i) {
        var tick = process.hrtime();
        setImmediate(function () {
            if (i === top) {
                callback(summary(times));
            } else {
                var tock = process.hrtime(tick);
                times[i] = tock[0] * 1e9 + tock[1];

                recursive(i + 1);
            }
        });
    })(0);
}

({
    'master': function () {
        var fork = require('child_process').fork;

        function bench(name, callback) {
            var cp = fork(__filename, ['baseline']);
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
        var top = 100000;
        timeit(top, function (stat) {
            process.send({ "mean": stat.mean(), "sd": stat.sd() });
        });
    },

    'trace': function () {
        require('./trace.js');
        var top = 100000;
        timeit(top, function (stat) {
            process.send({ "mean": stat.mean(), "sd": stat.sd() });
        });
    }
})[process.argv[2] || 'master']();
