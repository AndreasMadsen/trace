async function f1() {
  await Promise.resolve();
  throw new Error('FAIL');
}

async function f2() {
  await Promise.resolve()
  await f1();
}

async function f3() {
  await Promise.resolve();
  try {
    await f2();
  } catch (err) {
    console.log(err);
  }
}

f3();
