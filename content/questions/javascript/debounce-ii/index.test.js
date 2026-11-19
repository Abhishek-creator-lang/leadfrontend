import debounce from './index';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

describe('debounce with options', () => {
  test('defaults to trailing only, with the last arguments', async () => {
    const fn = jest.fn();
    const d = debounce(fn, 40);
    d('a');
    d('b');
    d('c');
    expect(fn).not.toHaveBeenCalled();
    await sleep(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('c');
  });

  test('leading only: runs on the first call and ignores the rest of the burst', async () => {
    const fn = jest.fn();
    const d = debounce(fn, 40, { leading: true, trailing: false });
    d('a');
    d('b');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('a');
    await sleep(100);
    expect(fn).toHaveBeenCalledTimes(1);
    d('c'); // new burst
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('c');
    d.cancel();
  });

  test('leading and trailing: a single call invokes only once', async () => {
    const fn = jest.fn();
    const d = debounce(fn, 30, { leading: true, trailing: true });
    d('only');
    await sleep(90);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('leading and trailing: a burst invokes at both edges', async () => {
    const fn = jest.fn();
    const d = debounce(fn, 30, { leading: true, trailing: true });
    d('first');
    d('second');
    d('third');
    expect(fn).toHaveBeenCalledTimes(1);
    await sleep(90);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn.mock.calls[0][0]).toBe('first');
    expect(fn.mock.calls[1][0]).toBe('third');
  });

  test('neither leading nor trailing never invokes', async () => {
    const fn = jest.fn();
    const d = debounce(fn, 20, { leading: false, trailing: false });
    d();
    d();
    await sleep(70);
    expect(fn).not.toHaveBeenCalled();
  });

  test('maxWait forces invocations during a continuous burst', async () => {
    const plain = jest.fn();
    const capped = jest.fn();
    const dPlain = debounce(plain, 50);
    const dCapped = debounce(capped, 50, { maxWait: 80 });
    const start = Date.now();
    while (Date.now() - start < 300) {
      dPlain();
      dCapped();
      await sleep(10);
    }
    expect(plain).not.toHaveBeenCalled();
    expect(capped.mock.calls.length).toBeGreaterThanOrEqual(2);
    dPlain.cancel();
    dCapped.cancel();
  });

  test('maxWait passes the latest arguments', async () => {
    const fn = jest.fn();
    const d = debounce(fn, 50, { maxWait: 80 });
    let i = 0;
    const start = Date.now();
    while (Date.now() - start < 300) {
      d(++i);
      await sleep(10);
    }
    d.cancel();
    const seen = fn.mock.calls.map((call) => call[0]);
    expect(seen.length).toBeGreaterThanOrEqual(2);
    // Never the very first call (leading is off), and always a newer call each time.
    expect(seen[0]).toBeGreaterThan(1);
    for (let k = 1; k < seen.length; k++) {
      expect(seen[k]).toBeGreaterThan(seen[k - 1]);
    }
  });

  test('uses `this` of the latest call', async () => {
    const seen = [];
    const fn = function () {
      seen.push(this.id);
    };
    const d = debounce(fn, 20);
    d.call({ id: 'a' });
    d.call({ id: 'b' });
    await sleep(60);
    expect(seen).toEqual(['b']);
  });

  test('returns the result of the most recent invocation', async () => {
    let n = 0;
    const d = debounce(() => ++n, 20, { leading: true });
    expect(d()).toBe(1);
    expect(d()).toBe(1);
    await sleep(60); // trailing call made n === 2
    expect(d()).toBe(3); // new burst, leading call
    d.cancel();
  });

  test('cancel() drops the pending call and resets the burst', async () => {
    const fn = jest.fn();
    const d = debounce(fn, 30, { leading: true });
    d('a');
    d('b');
    d.cancel();
    await sleep(70);
    expect(fn).toHaveBeenCalledTimes(1);
    d('c'); // a new burst, so leading fires again
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('c');
    d.cancel();
  });

  test('flush() runs the trailing call immediately, once', async () => {
    const fn = jest.fn(() => 'flushed');
    const d = debounce(fn, 50);
    d('x');
    expect(d.flush()).toBe('flushed');
    expect(fn).toHaveBeenCalledWith('x');
    await sleep(90);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('flush() respects trailing: false and is a no-op when idle', () => {
    const fn = jest.fn();
    const d = debounce(fn, 50, { leading: true, trailing: false });
    d('a');
    d('b');
    d.flush();
    expect(fn).toHaveBeenCalledTimes(1);
    d.flush();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
