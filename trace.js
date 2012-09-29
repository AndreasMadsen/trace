/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var hook = require('async-hook');
var chain = require('stack-chain');

// add currentTrace to the callSite array
chain.extend.attach(function (error, frames) {
  frames = frames.slice(0);
  frames.push.apply(frames, currentTrace);

  return frames;
});

// filter out trace and async-hook module
var ignore = [module.filename, require.resolve('async-hook')];
chain.filter.attach(function (error, frames) {

  return frames.filter(function (callSite) {
    return (ignore.indexOf(callSite.getFileName()) === -1);
  });
});

// keeps a long stack
var currentTrace = null;
var currentCallback = null;

hook.callback.attach(stackManager);
hook.event.attach(stackManager);

function stackManager(name, callback) {
  // slice 3 removes the noice trace from where new Error is invoked to
  // the async-hook monkey-patch function.
  var err = new Error();
  var trace = err.callSite.slice(0);
  if (currentTrace) trace.push.apply(trace, currentTrace);

  // this is executed in another event loop
  return function capture() {
    currentTrace = trace;
    currentCallback = capture;
    return callback.apply(this, arguments);
  };
}
