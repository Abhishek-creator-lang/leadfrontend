import mySetInterval, { myClearInterval } from './index';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

describe('mySetInterval / myClearInterval', () => {
  test('does not call the callback synchronously', () => {
    const cb = jest.fn();
    const id = mySetInterval(cb, 10);
    expect(cb).not.toHaveBeenCalled();
    myClearInterval(id);
  });

  test('calls the callback repeatedly', async () => {
    const cb = jest.fn();
    const id = mySetInterval(cb, 20);
    await sleep(130);
    myClearInterval(id);
    expect(cb.mock.calls.length).toBeGreaterThanOrEqual(3);
    expect(cb.mock.calls.length).toBeLessThanOrEqual(7);
  });

  test('passes extra arguments every time', async () => {
    const cb = jest.fn();
    const id = mySetInterval(cb, 10, 'a', 1);
    await sleep(60);
    myClearInterval(id);
    expect(cb.mock.calls.length).toBeGreaterThanOrEqual(2);
    cb.mock.calls.forEach((call) => expect(call).toEqual(['a', 1]));
  });

  test('myClearInterval stops future calls', async () => {
    const cb = jest.fn();
    const id = mySetInterval(cb, 15);
    await sleep(60);
    myClearInterval(id);
    const count = cb.mock.calls.length;
    expect(count).toBeGreaterThan(0);
    await sleep(80);
    expect(cb.mock.calls.length).toBe(count);
  });

  test('clearing before the first tick prevents every call', async () => {
    const cb = jest.fn();
    myClearInterval(mySetInterval(cb, 15));
    await sleep(60);
    expect(cb).not.toHaveBeenCalled();
  });

  test('can be cleared from inside the callback', async () => {
    let count = 0;
    const id = mySetInterval(() => {
      count++;
      if (count === 3) myClearInterval(id);
    }, 10);
    await sleep(150);
    expect(count).toBe(3);
  });

  test('returns distinct ids and intervals are independent', async () => {
    const a = jest.fn();
    const b = jest.fn();
    const idA = mySetInterval(a, 10);
    const idB = mySetInterval(b, 10);
    expect(idA).not.toBe(idB);
    myClearInterval(idA);
    await sleep(60);
    myClearInterval(idB);
    expect(a).not.toHaveBeenCalled();
    expect(b.mock.calls.length).toBeGreaterThan(0);
  });

  test('clearing an unknown or already-cleared id does nothing', () => {
    expect(() => myClearInterval(123456)).not.toThrow();
    const id = mySetInterval(() => {}, 10);
    myClearInterval(id);
    expect(() => myClearInterval(id)).not.toThrow();
  });
});
