import throttle from './index';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

describe('throttle', () => {
  test('returns a function', () => {
    expect(typeof throttle(() => {}, 10)).toBe('function');
  });

  test('runs the first call immediately', () => {
    const fn = jest.fn();
    const t = throttle(fn, 50);
    t('a');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('a');
    t.cancel();
  });

  test('ignores calls during the window except the latest, which runs at the end', async () => {
    const fn = jest.fn();
    const t = throttle(fn, 60);
    t('a');
    t('b');
    t('c');
    expect(fn).toHaveBeenCalledTimes(1);
    await sleep(100);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('c');
    await sleep(100);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('a single call has no trailing call', async () => {
    const fn = jest.fn();
    const t = throttle(fn, 30);
    t();
    await sleep(80);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('the trailing call opens a new window', async () => {
    const fn = jest.fn();
    const t = throttle(fn, 60);
    t('a');
    t('b'); // trailing at ~60ms, opens a window until ~120ms
    await sleep(80);
    expect(fn).toHaveBeenCalledTimes(2);
    t('c'); // inside the new window: must not run immediately
    expect(fn).toHaveBeenCalledTimes(2);
    await sleep(80);
    expect(fn).toHaveBeenCalledTimes(3);
    expect(fn).toHaveBeenLastCalledWith('c');
  });

  test('runs immediately again once idle', async () => {
    const fn = jest.fn();
    const t = throttle(fn, 30);
    t(1);
    await sleep(70);
    t(2);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith(2);
    t.cancel();
  });

  test('preserves `this` for leading and trailing calls', async () => {
    const seen = [];
    const obj = {
      id: 'obj',
      method: throttle(function () {
        seen.push(this.id);
      }, 30),
    };
    obj.method();
    obj.method();
    await sleep(70);
    expect(seen).toEqual(['obj', 'obj']);
  });

  test('cancel() drops the pending call and resets the throttle', async () => {
    const fn = jest.fn();
    const t = throttle(fn, 50);
    t('a');
    t('b');
    t.cancel();
    await sleep(90);
    expect(fn).toHaveBeenCalledTimes(1);
    t('c');
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('c');
    t.cancel();
  });

  test('limits the rate during a continuous stream of calls', async () => {
    const fn = jest.fn();
    const t = throttle(fn, 50);
    const start = Date.now();
    while (Date.now() - start < 220) {
      t();
      await sleep(5);
    }
    t.cancel();
    // ~220ms of calls with a 50ms window: roughly 4-6 calls, never one per event.
    expect(fn.mock.calls.length).toBeGreaterThanOrEqual(3);
    expect(fn.mock.calls.length).toBeLessThanOrEqual(7);
  });
});
