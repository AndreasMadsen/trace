'use strict';

const asyncWrap = process.binding('async_wrap');
const chain = require('stack-chain');
const timers = require('timers');

function AsyncWrap() {
  this.enabled = false;
  this.skip = 0;

  this.init = function noopInit() {}
  this.before = function noopBefore() {}
  this.after = function noopAfter() {}
}

function NextTickWrap() {}
function ImmediateWrap() {}
function TimeoutWrap() {}
function InvervalWrap() {}

AsyncWrap.prototype.wrap = function (object, name, Constructor) {
  const self = this;
  const old = object[name];
  object[name] = function () {
    const enabled = self.enabled;
    const handle = new Constructor();

    if (enabled) {
      // TODO: setTimout leaks a call site, is chain.filter the only way?
      self.skip += 1;
      self.init.call(handle, 0, null);
      self.skip -= 1;
    }

    const args = Array.from(arguments);
    const callback = args[0];
    args[0] = function () {
      if (enabled) self.before.call(handle);
      callback.apply(null, arguments);
      if (enabled) self.after.call(handle);
    };
    old.apply(object, args);
  };
}

AsyncWrap.prototype.setup = function (init, before, after) {
  this.init = init;
  this.before = before;
  this.after = after;

  asyncWrap.setupHooks(init, before, after);

  // Overwrite methods that async_wrap don't handle properly
  this.wrap(process, 'nextTick', NextTickWrap);

  this.wrap(timers, 'setImmediate', ImmediateWrap);
  this.wrap(timers, 'setTimeout', TimeoutWrap);
  this.wrap(timers, 'setInterval', InvervalWrap);

  global.setImmediate = timers.setImmediate;
  global.setTimeout = timers.setTimeout;
  global.setInterval = timers.setInterval;

  // Enable
  this.enable();
};

AsyncWrap.prototype.enable = function () {
  this.enabled = true;
  asyncWrap.enable();
};

AsyncWrap.prototype.disable = function () {
  this.enabled = false;
  asyncWrap.disable();
};

AsyncWrap.prototype.stackTrace = function (skip) {
  const limit = Error.stackTraceLimit;
  const slice = skip + this.skip;

  Error.stackTraceLimit = limit + slice;
  const stack = chain.callSite({
    extend: false,
    filter: true,
    slice: slice
  });
  Error.stackTraceLimit = limit;

  return stack;
};

module.exports = new AsyncWrap();
