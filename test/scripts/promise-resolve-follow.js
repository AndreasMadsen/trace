function f1() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('FAIL'));
    }, 0);
  }, 0);
}

function f2() {
  return new Promise((resolve, reject) => {
    f1().then(resolve, reject);
  });
}

function f3() {
  return Promise.resolve()
    .then(() => f2())
    .catch((err) => console.log(err));
}

f3();
