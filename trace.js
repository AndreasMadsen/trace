'use strict';

const chain = require('stack-chain');
const asyncHook = require('async-hook');

// Contains the call site objects of all the prevouse ticks leading
// up to this one
const stack = [null];
const traces = new Map();

//
// Mainiputlate stack trace
//
// add lastTrace to the callSite array
chain.extend.attach(function (error, frames) {
  const lastTrace = stack[stack.length - 1];
  frames.push.apply(frames, lastTrace);
  return frames;
});

//
// Track handle objects
//
asyncHook.addHooks({
  init: asyncInit,
  pre: asyncBefore,
  post: asyncAfter,
  destroy: asyncDestroy
});
asyncHook.enable();

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

function asyncInit(uid, handle, provider, parentUid) {
  const trace = getCallSites(2);

  // Add all the callSites from previuse ticks
  const lastTrace = stack[stack.length - 1];
  trace.push.apply(trace, parentUid === null ? lastTrace : traces.get(parentUid));

  // Cut the trace so it don't contain callSites there won't be shown anyway
  // because of Error.stackTraceLimit
  trace.splice(Error.stackTraceLimit);

  // `trace` now contains callSites from this ticks and all the ticks leading
  // up to this event in time
  traces.set(uid, trace);
}

function asyncBefore(uid) {
  // push the associated trace to the stack for this specific async action,
  // thereby allowing it to become a part of a error `stack` string.
  stack.push(traces.get(uid));
}

function asyncAfter(uid) {
  // remove the associated on the stack.
  // In some cases the such the handle context is lost. So this prevents the
  // callSites leaking into the wrong stack trace.
  // In other cases MakeCallback is called synchronously, this causes there
  // to be more than one push on the stack. So this also recover the relevant
  // stack for the parent.
  stack.pop();
}

function asyncDestroy(uid) {
  traces.delete(uid);
}
