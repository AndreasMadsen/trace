
var chain = require('stack-chain');

// Contains the call site objects of all the prevouse ticks leading
// up to this one
var callSitesForPreviuseTicks = null;

// add currentTrace to the callSite array
chain.extend.attach(function (error, frames) {
  frames = frames.slice(0);
  frames.push.apply(frames, callSitesForPreviuseTicks);
  return frames;
});

// Setup an async listener with the handlers listed below
process.addAsyncListener({
  'create': asyncFunctionInitialized,
  'before': asyncCallbackBefore,
  'error': asyncCallbackError,
  'after': asyncCallbackAfter
});

function asyncFunctionInitialized() {
  // Capture the callSites for this tick
  var err = new Error();
  // .slice(2) removes first this file and then process.runAsyncQueue from the
  // callSites array. Both of those only exists because of this module.
  var trace = err.callSite.slice(2);

  // Add all the callSites from previuse ticks
  trace.push.apply(trace, callSitesForPreviuseTicks);

  // `trace` now contains callSites from this ticks and all the ticks leading
  // up to this event in time
  return trace;
}

function asyncCallbackBefore(context, trace) {
  // restore previuseTicks for this specific async action, thereby allowing it
  // to become a part of a error `stack` string
  callSitesForPreviuseTicks = trace;
}

function asyncCallbackError(trace, error) {
  // Ensure that the error `stack` string is constructed before the
  // previuseTicks is cleared.
  // The construction logic is defined in
  //  - https://github.com/v8/v8/blob/master/src/messages.js -> captureStackTrace
  // and in the stack-chain module invoked earlier in this file
  error.stack;

  // clear previuseTicks
  callSitesForPreviuseTicks = null;
}

function asyncCallbackAfter(context, trace) {
  // clear previuseTicks. This allows for other async actions to get there
  // very own trace stack and helps in preventing a trace stack to get attach
  // to an error `stack` string, in the unknown case where asyncCallbackBefore
  // wasn't invoked. (This is an unseen event since trace v1.0.0)
  callSitesForPreviuseTicks = null;
}
