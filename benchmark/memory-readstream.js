'use strict';

const tracker = require('./memory.js');
const fs = require('fs');
require('../trace');

tracker.start();

const stream = fs.createReadStream('/dev/random');
stream.resume();

setTimeout(function () {
    stream.pause();
    setTimeout(function () {
      tracker.stop();
    }, 5 * 1000);
}, 5 * 60 * 1000);
