
// This is an incomplete polyfill for tracing. It is mostly incomplete
// because it only supports one `addAsyncListener` call. It also doesn't
// care about the context object or initalized userData. And can only
// listen to throws, not prevent them.
var asyncWrap = process.binding('async_wrap');
var timers = require('timers');

exports.addAsyncListener = addAsyncListener;

var globalUserData = null;

function addAsyncListener(hooks) {
  // Enable asyncWrap and call init hook function on async initialization
  if (asyncWrap.enable) {
      asyncWrap.setupHooks(create, before, after);
      asyncWrap.enable();
  } else {
    var asyncHooksObject = {};
    var kCallInitHook = 0;
    asyncWrap.setupHooks(asyncHooksObject, create, before, after);
    asyncHooksObject[kCallInitHook] = 1;
  }

  function create() {
    if (this.constructor.name !== 'Timer') {
      this._userData = hooks.create();
    }
  }

  function before() {
    if (this.constructor.name !== 'Timer') {
      hooks.before(null, this._userData);
      globalUserData = this._userData;
    }
  }

  function after() {
    if (this.constructor.name !== 'Timer') {
      globalUserData = null;
      hooks.after(null, this._userData);
    }
  }

  // Wrap timers
  var globalTimersAliased = (global.setTimeout === timers.setTimeout);
  wrap(process, 'nextTick', hooks);
  wrap(timers, 'setImmediate', hooks);
  wrap(timers, 'setTimeout', hooks);
  wrap(timers, 'setInterval', hooks);

  if (globalTimersAliased) {
    global.setTimeout = timers.setTimeout;
    global.setInterval = timers.setInterval;
    global.setImmediate = timers.setImmediate;
  }

  // Intercept throws
  var oldfatalException = process._fatalException;
  process._fatalException = function (er) {
    hooks.error(globalUserData, er);
    globalUserData = null;
    return oldfatalException.call(process, er);
  };
}

// Assums the first argument is the callback
function wrap(object, method, hooks) {
  var old = object[method];

  object[method] = function () {
    var userData = hooks.create();
    var callback = arguments[0];

    arguments[0] = function tracing_polyfill_remove_me_from_stack() {
      hooks.before(null, userData);
      globalUserData = userData;
      callback.apply(this, arguments);
      globalUserData = null;
      hooks.after(null, userData);
    };
    return old.apply(object, arguments);
  };
}
