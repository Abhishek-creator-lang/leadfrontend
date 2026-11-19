import setCancellableTimeout from './index';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

describe('setCancellableTimeout', () => {
  test('returns a function', () => {
    const cancel = setCancellableTimeout(() => {}, 10);
    expect(typeof cancel).toBe('function');
    cancel();
  });

  test('runs the callback after the delay', async () => {
    const cb = jest.fn();
    setCancellableTimeout(cb, 20);
    expect(cb).not.toHaveBeenCalled();
    await sleep(60);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  test('passes extra arguments to the callback', async () => {
    const cb = jest.fn();
    setCancellableTimeout(cb, 5, 'a', 2);
    await sleep(40);
    expect(cb).toHaveBeenCalledWith('a', 2);
  });

  test('cancelling before the delay prevents the call', async () => {
    const cb = jest.fn();
    const cancel = setCancellableTimeout(cb, 20);
    await sleep(5);
    cancel();
    await sleep(60);
    expect(cb).not.toHaveBeenCalled();
  });

  test('delay defaults to 0 but is still asynchronous', async () => {
    const cb = jest.fn();
    setCancellableTimeout(cb);
    expect(cb).not.toHaveBeenCalled();
    await sleep(20);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  test('cancelling after the callback ran, or twice, is a no-op', async () => {
    const cb = jest.fn();
    const cancel = setCancellableTimeout(cb, 5);
    await sleep(40);
    expect(() => {
      cancel();
      cancel();
    }).not.toThrow();
    expect(cb).toHaveBeenCalledTimes(1);
  });

  test('cancelling one timer does not affect another', async () => {
    const a = jest.fn();
    const b = jest.fn();
    const cancelA = setCancellableTimeout(a, 20);
    setCancellableTimeout(b, 20);
    cancelA();
    await sleep(60);
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(1);
  });
});
