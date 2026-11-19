import setCancellableInterval from './index';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

describe('setCancellableInterval', () => {
  test('returns a function', () => {
    const cancel = setCancellableInterval(() => {}, 10);
    expect(typeof cancel).toBe('function');
    cancel();
  });

  test('calls the callback repeatedly', async () => {
    const cb = jest.fn();
    const cancel = setCancellableInterval(cb, 20);
    await sleep(130);
    cancel();
    expect(cb.mock.calls.length).toBeGreaterThanOrEqual(3);
    expect(cb.mock.calls.length).toBeLessThanOrEqual(7);
  });

  test('passes extra arguments on every call', async () => {
    const cb = jest.fn();
    const cancel = setCancellableInterval(cb, 10, 'x', 1);
    await sleep(50);
    cancel();
    expect(cb.mock.calls.length).toBeGreaterThan(0);
    cb.mock.calls.forEach((call) => expect(call).toEqual(['x', 1]));
  });

  test('stops calling after cancel', async () => {
    const cb = jest.fn();
    const cancel = setCancellableInterval(cb, 15);
    await sleep(60);
    cancel();
    const count = cb.mock.calls.length;
    await sleep(80);
    expect(cb.mock.calls.length).toBe(count);
  });

  test('cancelling before the first tick prevents every call', async () => {
    const cb = jest.fn();
    const cancel = setCancellableInterval(cb, 20);
    cancel();
    await sleep(80);
    expect(cb).not.toHaveBeenCalled();
  });

  test('can be cancelled from inside the callback', async () => {
    let ticks = 0;
    const cancel = setCancellableInterval(() => {
      ticks++;
      if (ticks === 2) cancel();
    }, 10);
    await sleep(120);
    expect(ticks).toBe(2);
  });

  test('cancelling twice is a no-op', () => {
    const cancel = setCancellableInterval(() => {}, 10);
    expect(() => {
      cancel();
      cancel();
    }).not.toThrow();
  });
});
