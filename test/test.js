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
      callback(null, prepareString(output.toString('ascii')));
    }));
  },

  types: {
    'txt': {
      test: function (t, actual, expected) {
        t.strictEqual(actual.trim(), expected.trim());
      },
      update: function (actual) {
        return actual;
      }
    }
  }
});

function prepareString(text) {
  const lines = stripPosInfo(text).split('\n');

  const processedLines = lines.map((line) => {
    const isTraceLine = line.match(/:[0-9]+:[0-9]+/);
    const isFromTestScript = line.includes(__dirname);

    const processedLine = line.replace(__dirname, '') + '\n';

    if (isTraceLine && !isFromTestScript) {
      // Only include stack trace lines from our test code.
      // This stops the tests from breaking whenever we change Node.js version.
      return '';
    }
    return processedLine;
  });

  return processedLines.join('');
}

function stripPosInfo(text) {
  return text.replace(/:[0-9]+:[0-9]+/g, ':r:c');
}
