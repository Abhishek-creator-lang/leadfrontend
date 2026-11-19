import debounce from './index';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

describe('debounce', () => {
  test('returns a function', () => {
    expect(typeof debounce(() => {}, 10)).toBe('function');
  });

  test('does not call func synchronously', () => {
    const fn = jest.fn();
    debounce(fn, 10)();
    expect(fn).not.toHaveBeenCalled();
  });

  test('calls func once after the wait', async () => {
    const fn = jest.fn();
    const d = debounce(fn, 20);
    d();
    await sleep(60);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('collapses a burst of calls into one', async () => {
    const fn = jest.fn();
    const d = debounce(fn, 40);
    d();
    await sleep(10);
    d();
    await sleep(10);
    d();
    expect(fn).not.toHaveBeenCalled();
    await sleep(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('restarts the timer on every call', async () => {
    const fn = jest.fn();
    const d = debounce(fn, 60);
    d();
    await sleep(40);
    d();
    await sleep(40);
    expect(fn).not.toHaveBeenCalled();
    await sleep(80);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('uses the arguments of the last call', async () => {
    const fn = jest.fn();
    const d = debounce(fn, 20);
    d(1);
    d(2, 3);
    await sleep(60);
    expect(fn).toHaveBeenCalledWith(2, 3);
  });

  test('preserves `this`', async () => {
    let seen;
    const obj = {
      value: 42,
      method: debounce(function () {
        seen = this.value;
      }, 10),
    };
    obj.method();
    await sleep(50);
    expect(seen).toBe(42);
  });

  test('wait defaults to 0 but is still asynchronous', async () => {
    const fn = jest.fn();
    const d = debounce(fn);
    d();
    expect(fn).not.toHaveBeenCalled();
    await sleep(20);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('cancel() drops the pending call', async () => {
    const fn = jest.fn();
    const d = debounce(fn, 20);
    d();
    d.cancel();
    await sleep(60);
    expect(fn).not.toHaveBeenCalled();
  });

  test('flush() runs the pending call immediately, once', async () => {
    const fn = jest.fn();
    const d = debounce(fn, 50);
    d('x');
    d.flush();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('x');
    await sleep(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('flush() with nothing pending is a no-op', () => {
    const fn = jest.fn();
    const d = debounce(fn, 10);
    d.flush();
    expect(fn).not.toHaveBeenCalled();
  });

  test('can be called again after firing', async () => {
    const fn = jest.fn();
    const d = debounce(fn, 10);
    d();
    await sleep(40);
    d();
    await sleep(40);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
