'use strict';

const interpreted = require('interpreted');
const execspawn = require('execspawn');
const endpoint = require('endpoint');
const path = require('path');
const process = require('process');

const TRACE_PATH = path.resolve(__dirname, '../trace.js');
const SCRIPTS_PATH = path.resolve(__dirname, 'scripts');
const EXPECTED_PATH = path.resolve(__dirname, 'expected');

interpreted({
  source: SCRIPTS_PATH,
  expected: EXPECTED_PATH,
  readSource: false,

  update: true,

  test: function (name, callback) {
    const filepath = path.join(SCRIPTS_PATH, name + '.js');
    const p = execspawn(`${process.execPath} -r ${TRACE_PATH} --stack-trace-limit=1000 ${JSON.stringify(filepath)} 2>&1`);
    p.stdout.pipe(endpoint(function (err, output) {
      if (err) return callback(err);
      callback(null, stripNodeVersion(stripPosInfo(stripPath(output.toString('ascii')))));
    }));
  },

  types: {
    'txt': {
      test: function (t, actual, expected) {
        t.strictEqual(actual, expected);
      },
      update: function (actual) {
        return actual;
      }
    }
  }
});

function stripPath(output) {
  return output.split(__dirname).join('');
}

function stripPosInfo(text) {
  return text.replace(/:[0-9]+:[0-9]+/g, ':r:c');
}

function stripNodeVersion(text) {
  return text.replace(`Node.js ${process.version}`, 'Node.js vx.y.z');
}
