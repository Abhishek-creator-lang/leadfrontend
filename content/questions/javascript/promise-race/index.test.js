import promiseRace from './index';

const delay = (ms, value, fail = false) =>
  new Promise((resolve, reject) => setTimeout(() => (fail ? reject(value) : resolve(value)), ms));

const PENDING = Symbol('pending');
const settledWithin = (promise, ms) => Promise.race([promise, delay(ms, PENDING)]);

describe('promiseRace', () => {
  test('returns a promise', () => {
    expect(promiseRace([1])).toBeInstanceOf(Promise);
  });

  test('fulfills with the first value to settle', async () => {
    await expect(promiseRace([delay(50, 'slow'), delay(10, 'fast')])).resolves.toBe('fast');
  });

  test('rejects if the first item to settle rejects', async () => {
    const error = new Error('boom');
    await expect(promiseRace([delay(50, 'slow'), delay(5, error, true)])).rejects.toBe(error);
  });

  test('ignores a rejection that comes after the winner', async () => {
    await expect(promiseRace([delay(5, 'win'), delay(20, 'late', true)])).resolves.toBe('win');
  });

  test('settles asynchronously even for plain values', async () => {
    const onFulfilled = jest.fn();
    promiseRace([1]).then(onFulfilled);
    expect(onFulfilled).not.toHaveBeenCalled();
    await delay(0);
    expect(onFulfilled).toHaveBeenCalledWith(1);
  });

  test('picks the first already-settled item in iteration order', async () => {
    await expect(promiseRace([Promise.resolve('a'), 'b'])).resolves.toBe('a');
    await expect(promiseRace(['b', Promise.resolve('a')])).resolves.toBe('b');
  });

  test('adopts thenables', async () => {
    const thenable = { then: (resolve) => resolve('thenable') };
    await expect(promiseRace([delay(30, 'slow'), thenable])).resolves.toBe('thenable');
  });

  test('stays pending for an empty iterable', async () => {
    await expect(settledWithin(promiseRace([]), 50)).resolves.toBe(PENDING);
  });

  test('accepts any iterable', async () => {
    await expect(promiseRace(new Set([delay(10, 'set')]))).resolves.toBe('set');
  });

  test('rejects with a TypeError for a non-iterable', async () => {
    await expect(promiseRace(123)).rejects.toBeInstanceOf(TypeError);
  });
});
