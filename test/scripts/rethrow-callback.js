function asyncFunction(callback) {
  process.nextTick(callback, new Error('error'));
}

function mainFunction() {
  asyncFunction(function nextTickFunction(err) {
    process.nextTick(() => {
      throw err;
    })
  });
}

mainFunction();
