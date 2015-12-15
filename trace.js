'use strict';

const chain = require('stack-chain');
const asyncWrap = require('./async_wrap.js');
const providers = process.binding('async_wrap').Providers;
const asyncWrapFilepath = require.resolve('./async_wrap.js');

// Contains the call site objects of all the prevouse ticks leading
// up to this one
let callSitesForPreviuseTicks = null;

//
// Mainiputlate stack trace
//
// add currentTrace to the callSite array
chain.extend.attach(function (error, frames) {
  frames.push.apply(frames, callSitesForPreviuseTicks);
  return frames;
});
// remove call sites caused by monkey patched functions
chain.filter.attach(function (error, frames) {
  return frames.filter(function (callSite) {
    return callSite.getFileName() !== asyncWrapFilepath;
  });
});

//
// Track handle objects
//
asyncWrap.setup(asyncInit, asyncBefore, asyncAfter);

function asyncInit(provider, id, parent) {
  if (provider === providers.TIMERWRAP) {
    this._traceIgnore = true;
    return;
  }

  // Capture the callSites for this tick
  const trace = asyncWrap.stackTrace(2);

  // Add all the callSites from previuse ticks
  trace.push.apply(trace, parent ? parent._traceState : callSitesForPreviuseTicks);

  // Cut the trace so it don't contain callSites there won't be shown anyway
  // because of Error.stackTraceLimit
  trace.splice(Error.stackTraceLimit);

  // `trace` now contains callSites from this ticks and all the ticks leading
  // up to this event in time
  this._traceState = trace;
}

function asyncBefore() {
  if (this._traceIgnore) return;

  // restore previuseTicks for this specific async action, thereby allowing it
  // to become a part of a error `stack` string
  callSitesForPreviuseTicks = this._traceState;
}

function asyncAfter() {
  if (this._traceIgnore) return;

  // clear `callSitesForPreviuseTicks`. In some cases the such as Promises the
  // handle context is lost. So to prevent callSites leaking into the wrong
  // stack trace, clear `callSitesForPreviuseTicks` here.
  callSitesForPreviuseTicks = null;
}

//
// Intercept throws
//
const oldFatalException = process._fatalException;
process._fatalException = function (error) {
  // Ensure that the error `stack` string is constructed before the
  // `callSitesForPreviuseTicks` is cleared.
  // The construction logic is defined in
  //  - https://github.com/v8/v8/blob/master/src/messages.js -> captureStackTrace
  // and in the stack-chain module invoked earlier in this file
  error.stack;

  // Allow error to propergate
  return oldFatalException.call(process, error);
};
