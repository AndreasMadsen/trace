'use strict';

function binomial() {
  return new Promise(function binomialPromise() {
    throw new Error('throwing first thing');
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
