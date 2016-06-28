function bad() {
  throw new Error('custom error');
}

setTimeout(bad, 10);
setTimeout(bad, 20);
