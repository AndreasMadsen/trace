'use strict';

const interpreted = require('interpreted');
const execspawn = require('execspawn');
const endpoint = require('endpoint');
const path = require('path');

const SCRIPTS_PATH = path.resolve(__dirname, 'scripts');

interpreted({
  source: SCRIPTS_PATH,
  expected: path.resolve(__dirname, 'expected'),
  readSource: false,

  update: false,

  test: function (name, callback) {
    const filepath = path.join(SCRIPTS_PATH, name + '.js');
    const p = execspawn(`${process.execPath} -r ../trace.js --stack-trace-limit=1000 ${JSON.stringify(filepath)} 2>&1`);
    p.stdout.pipe(endpoint(function (err, output) {
      if (err) return callback(err);
      callback(null, simplify(output.toString('ascii')));
    }));
  },

  types: {
    'txt': {
      test: function (t, actual, expected) {
        t.strictEqual(stripPosInfo(actual), stripPosInfo(expected));
      },
      update: function (actual) {
        return actual;
      }
    }
  }
});

function simplify(output) {
  return output.split(__dirname).join('');
}

function stripPosInfo(text) {
  return text.replace(/:[0-9]+:[0-9]+/g, ':r:c');
}
