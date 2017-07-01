'use strict';

function binomial() {
  return Promise.resolve(/* timeout */).then(function binomialThen() {
    throw new Error('after timeout');
  });
}

function abacus() {
  return Promise.resolve().then(function abacusThen() {
    return binomial();
  });
}

abacus().catch(function (e) {
  process._rawDebug(e);
});
