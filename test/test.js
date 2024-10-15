'use strict';

const interpreted = require('interpreted');
const execspawn = require('execspawn');
const endpoint = require('endpoint');
const path = require('path');
const process = require('process');

const TRACE_PATH = path.resolve(__dirname, '../trace.js');
const SCRIPTS_PATH = path.resolve(__dirname, 'scripts');

const NODEJS_VERSION_MAJOR = Number.parseInt(process.versions.node.split('.')[0]);
const EXPECTED_PATH = NODEJS_VERSION_MAJOR >= 20 ? path.resolve(__dirname, 'expected', 'v20') : path.resolve(__dirname, 'expected')

interpreted({
  source: SCRIPTS_PATH,
  expected: EXPECTED_PATH,
  readSource: false,

  update: false,

  test: function (name, callback) {
    const filepath = path.join(SCRIPTS_PATH, name + '.js');
    const p = execspawn(`${process.execPath} -r ${TRACE_PATH} --stack-trace-limit=1000 ${JSON.stringify(filepath)} 2>&1`);
    p.stdout.pipe(endpoint(function (err, output) {
      if (err) return callback(err);
      callback(null, stripPosInfo(stripPath(output.toString('ascii'))));
    }));
  },

  types: {
    'txt': {
      test: function (t, actual, expected) {
        t.strictEqual(actual, expected.replace('v20.15.1', process.version));
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
