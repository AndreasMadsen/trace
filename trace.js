/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var hook = require('async-hook');

// use a already existing formater or fallback to the default one
var format = Error.prepareStackTrace || require('./format.js');

Error.prepareStackTrace = function (error, callSite) {
  // Store v8 call site object
  error.callSite = callSite;

  // this will be filled up
  var extendedCallSite = callSite.slice(0);

  // add the stack trace from previous event loops
  extendedCallSite.push.apply(extendedCallSite, currentTrace);

  // reduce extendedCallSite to match Error.stackTraceLimit
  extendedCallSite = filterCallSite(extendedCallSite);
  extendedCallSite = extendedCallSite.slice(0, Error.stackTraceLimit);

  // return standart formated stack trace
  return format(error, extendedCallSite);
};

// Manage call site storeage
Object.defineProperty(Error.prototype, 'callSite', {
  'get': function () {
    // return callSite if it already exist
    if (this._callSite) {
      return this._callSite;
    }

    // calculate call site object
    var stack = this.stack;

    // return call site object
    return this._callSite;
  },

  'set': function (callSite) {
    // set a hidden writable ._callSite property
    Object.defineProperty(this, '_callSite', {
      value: callSite,
      configurable: true,
      writable: true
    });
  },

  configurable: true
});

// Cleanup call site object
var ignore = [module.filename, require.resolve('async-hook')];
function filterCallSite(callSite) {
  var ret = [];

  for (var i = 0, l = callSite.length; i < l; i++) {
    if (ignore.indexOf(callSite[i].getFileName()) === -1) {
      ret.push(callSite[i]);
    }
  }

  return ret;
}

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
