
function timeit(top, callback) {
    var tick = process.hrtime();

    (function recursive(i) {
        setImmediate(function () {
            if (i === top) callback(process.hrtime(tick));
            else recursive(i + 1);
        });
    })(0);
}

({
    'master': function () {
        var fork = require('child_process').fork;

        function bench(name, callback) {
            var cp = fork(__filename, ['baseline']);
            cp.once('message', function (result) {
                var ns = result.time[0] * 1e9 + result.time[1];
                console.log(name + ': ' + (ns / result.top) + ' ns/tick');
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
        var top = 1000000;
        timeit(top, function (time) {
            process.send({ "time": time, "top": top });
        });
    },

    'trace': function () {
        require('./trace.js');
        var top = 1000000;
        timeit(top, function (time) {
            process.send({ "time": time, "top": top });
        });
    }
})[process.argv[2] || 'master']();
