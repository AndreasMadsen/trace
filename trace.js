'use strict';

const DEBUG = false;
const {debug} = DEBUG ? require('./debug') : {};

const chain = require('stack-chain');
const asyncHook = require('async_hooks');

// Contains the Trace objects of all active async execution contexts
const traces = new Map();

// Manipulate stack traces
chain.filter.attach(filterFrames);
chain.extend.attach(extendFrames);
function filterFrames(error, frames) {
  return frames.filter((callSite) => {
    const name = callSite && callSite.getFileName();
    return name !== 'async_hooks.js' && name !== 'internal/async_hooks.js';
  });
}
function extendFrames(error, frames) {
  const asyncId = asyncHook.executionAsyncId();
  const trace = traces.get(asyncId);

  if (!trace) {
    return frames;
  }


  trace.sortStacks();

  if (DEBUG) {
    debug(`extending: ${asyncId} with ${trace.stacks.map(({asyncId}) => asyncId)}`);
  }

  for (const stack of trace.stacks) {
    appendUniqueFrames(frames, stack.frames);
  }

  return frames;
}

function appendUniqueFrames(frames, newFrames) {
  for (let i = 1; i <= newFrames.length && frames.length > 1; ++i) {
    if (equalCallSite(newFrames[newFrames.length - i], frames[frames.length - 1])) {
      frames.pop();
    }
  }

  frames.push(...newFrames);
}


//
// Track handle objects
//
const hooks = asyncHook.createHook({
  init: asyncInit,
  destroy: asyncDestroy
});
hooks.enable();

function getCallSites(skip) {
  const limit = Error.stackTraceLimit;

  Error.stackTraceLimit = limit + skip;
  const frames = chain.callSite({
    extend: false,
    filter: true,
    slice: skip
  });
  Error.stackTraceLimit = limit;

  return copyFrames(frames);
}

// We must take a copy of the CallSite objects to avoid retaining references to Promises.
// If we retain a Promise reference then asyncDestroy for the Promise won't be called,
// so we'll leak memory.
class CallSiteCopy {
  constructor(callSite) {
    this._fileName = callSite.getFileName();
    this._lineNumber = callSite.getLineNumber();
    this._columnNumber = callSite.getColumnNumber();
    this._toString = callSite.toString(); // TODO this is slow
  }

  getFileName() {
    return this._fileName;
  }

  getLineNumber() {
    return this._lineNumber;
  }

  getColumnNumber() {
    return this._columnNumber;
  }

  toString() {
    return this._toString;
  }
}

function copyFrames(frames) {
  return frames.map((callSite) => new CallSiteCopy(callSite));
}

function equalCallSite(a, b) {
  const aFile = a.getFileName();
  const aLine = a.getLineNumber();
  const aColumn = a.getColumnNumber();

  return (aFile === b.getFileName() &&
          aLine === b.getLineNumber() &&
          aColumn === b.getColumnNumber());
}

//
// Async hook functions
//

function asyncInit(asyncId, type, triggerAsyncId) {
  const frames = getCallSites(2);
  const stack = new NamedStack(asyncId, frames);
  const trace = new Trace(asyncId, stack);
  traces.set(asyncId, trace);
  if (DEBUG) debug(`asyncInit ${stack}`);

  const triggerTrace = traces.get(triggerAsyncId);
  if (triggerTrace) {
    triggerTrace.recordRelatedTrace(trace);
  }
}

function asyncDestroy(asyncId) {
  if (DEBUG) debug(`asyncDestroy ${asyncId}`);
  traces.delete(asyncId);
}



//
// Async context graph data structure
//

class NamedStack {
  constructor(asyncId, frames) {
    this.asyncId = asyncId;
    this.frames = frames;
  }

  toString() {
    return `${this.asyncId}\n  ${this.frames.join('\n  ')}\n`;
  }
}

class Trace {
  constructor(asyncId, stack) {
    this.asyncId = asyncId;
    this.stacks = [stack];
  }

  recordRelatedTrace(trace) {
    mergeStacks(trace.stacks, this.stacks);
  }

  sortStacks() {
    this.stacks.sort((a, b) => b.asyncId - a.asyncId);
  }
}

function mergeStacks(dest, source) {
  for (const stack of source) {
    if (!dest.includes(stack)) {
      dest.push(stack);
    }
  }
}

