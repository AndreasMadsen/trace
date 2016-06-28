#trace [![Build Status](https://secure.travis-ci.org/AndreasMadsen/trace.png)](http://travis-ci.org/AndreasMadsen/trace)

> Creates super long stack traces

See http://andreasmadsen.github.io/trace/ for examples.

**Trace only works on node.js 4 and newer.**

## How

```sheel
npm install trace
node --stack_trace_limit=100 -r trace debug-me.js
```

This will provide a very long stack trace, if you are not interested in
node internal lines, take a look at [clarify](https://github.com/AndreasMadsen/clarify).

```sheel
npm install clarify
node --stack_trace_limit=100 -r trace -r clarify debug-me.js
```

For specific examples see http://andreasmadsen.github.io/trace/.

## Found a bug?

I encourage you to file any bugs you may find, even if you can't reduce the
issue to only involve nodecore modules. I will then use all my power to fix it.

> I want this module to be the best and most trusted async trace module ever!
