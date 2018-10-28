'use strict';

// We cannot use console.log for debugging because it would call back into our hook
const fs = require('fs');
function debug(msg) {
  fs.writeSync(1, 'trace.js DEBUG ' + msg + '\n');
}

function printRootTraces(traces) {
  const rootAsyncIds = findRootAsyncIds(traces);
  for (const asyncId of rootAsyncIds) {
    printTree(traces, traces.get(asyncId));
  }
}

function findRootAsyncIds(traces) {
  const asyncIds = new Set(traces.keys());
  for (const trace of traces.values()) {
    for (const notRootTrace of trace.relatedTraces) {
      asyncIds.delete(notRootTrace.asyncId);
    }
  }
  return asyncIds;
}

function printTree(traces, trace, indent='', isLast=true, visited=new Set()) {
  let line = indent + '\\-' + trace.asyncId;

  if (isLast) {
    indent += ' ';
  } else {
    indent += '| ';
  }

  if (!traces.get(trace.asyncId)) {
    line += ' (not-root)';
  }

  if (visited.has(trace.asyncId)) {
    line += ' (cycle)';
  }

  fs.writeSync(1, line + '\n');

  if (visited.has(trace.asyncId)) {
    return;
  }
  visited.add(trace.asyncId);

  for (let i = 0; i < trace.relatedTraces.length; ++i) {
    const isLast = i === trace.relatedTraces.length - 1;
    printTree(traces, trace.relatedTraces[i], indent, isLast, visited);
  }
}

module.exports = {
  debug,
  printRootTraces
};
