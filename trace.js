'use strict';

const chain = require('stack-chain');
const asyncHook = require('async_hooks');

// Contains init asyncId of the active scope(s)
// Because we can't know when the root scope ends, a permanent Set is keept
// for the root scope.
const executionScopeInits = new Set();
let executionScopeDepth = 0;
// Contains the call site objects of all active scopes
const traces = new Map();

//
// Mainiputlate stack trace
//
// add lastTrace to the callSite array
chain.filter.attach(function (error, frames) {
  return frames.filter(function (callSite) {
    const name = callSite && callSite.getFileName();
    return name !== 'async_hooks.js' && name !== 'internal/async_hooks.js';
  });
});

chain.extend.attach(function (error, frames) {
  const lastTrace = traces.get(asyncHook.executionAsyncId());
  frames.push.apply(frames, lastTrace);
  return frames;
});

//
// Track handle objects
//
const hooks = asyncHook.createHook({
  init: asyncInit,
  before: asyncBefore,
  after: asyncAfter,
  destroy: asyncDestroy
});
hooks.enable();
exports.disable = () => hooks.disable();

// A fake CallSite which visually separates stacks from different async contexts
const asyncContextCallSiteMarker = {
  getFileName: () => null,
  getLineNumber: () => 0,
  getColumnNumber: () => 0,
  toString: () => '____________________:0:0'
};

function getCallSites(skip) {
  const limit = Error.stackTraceLimit;

  Error.stackTraceLimit = limit + skip;
  const stack = chain.callSite({
    extend: false,
    filter: true,
    slice: skip
  });
  Error.stackTraceLimit = limit;

  return stack;
}

function equalCallSite(a, b) {
  const aFile = a.getFileName();
  const aLine = a.getLineNumber();
  const aColumn = a.getColumnNumber();

  if (aFile === null || aLine === null || aColumn === null) {
    return false;
  }

  return (aFile === b.getFileName() &&
          aLine === b.getLineNumber() &&
          aColumn === b.getColumnNumber());
}

function asyncInit(asyncId, type, triggerAsyncId, resource) {
  const trace = getCallSites(2);

  // In cases where the trigger is in the same synchronous execution scope
  // as this resource, the stack trace of the trigger will overlap with
  // `trace`, this mostly happens with promises.
  // Example:
  //   p0 = Promise.resolve(1); // will have `root` in stack trace
  //   p1 = p0.then(() => throw new Error('hello')); // will also have `root`
  // The async stack trace should be: root, p0, p1
  //
  // To avoid (n^2) string matching, it is assumed that `Error.stackTraceLimit`
  // hasn't changed. By this assumtion we know the current trace will go beyond
  // the trigger trace, thus the check can be limited to trace[-1].
  if (executionScopeInits.has(triggerAsyncId)) {
    const parentTrace = traces.get(triggerAsyncId);

    let i = parentTrace.length;
    while(i-- && trace.length > 1) {
      if (equalCallSite(parentTrace[i], trace[trace.length - 1])) {
        trace.pop();
      }
    }
  }

  // Add all the callSites from previuse ticks
  if (triggerAsyncId !== 0) {
    trace.push(asyncContextCallSiteMarker);
    trace.push.apply(trace, traces.get(triggerAsyncId));
  }

  // Cut the trace so it don't contain callSites there won't be shown anyway
  // because of Error.stackTraceLimit
  trace.splice(Error.stackTraceLimit);

  // `trace` now contains callSites from this ticks and all the ticks leading
  // up to this event in time
  traces.set(asyncId, trace);

  // add asyncId to the list of all inits in this execution scope
  executionScopeInits.add(asyncId);
}

function asyncBefore(asyncId) {
  if (executionScopeDepth === 0) {
    executionScopeInits.clear();
  }
  executionScopeDepth += 1;
}

function asyncAfter(asyncId) {
  executionScopeDepth -= 1;
}

function asyncDestroy(asyncId) {
  traces.delete(asyncId);
}
