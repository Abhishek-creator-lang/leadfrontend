import promiseAll from './index';

const delay = (ms, value, fail = false) =>
  new Promise((resolve, reject) => setTimeout(() => (fail ? reject(value) : resolve(value)), ms));

describe('promiseAll', () => {
  test('returns a promise', () => {
    const result = promiseAll([]);
    expect(result).toBeInstanceOf(Promise);
  });

  test('resolves with values in input order, not completion order', async () => {
    await expect(promiseAll([delay(40, 'a'), delay(10, 'b'), delay(20, 'c')])).resolves.toEqual(['a', 'b', 'c']);
  });

  test('treats plain values as fulfilled', async () => {
    await expect(promiseAll([1, Promise.resolve(2), 'three'])).resolves.toEqual([1, 2, 'three']);
  });

  test('resolves an empty iterable with an empty array', async () => {
    await expect(promiseAll([])).resolves.toEqual([]);
  });

  test('rejects with the first rejection reason', async () => {
    const error = new Error('first');
    await expect(promiseAll([delay(50, 'ok'), delay(10, error, true), delay(30, 'late', true)])).rejects.toBe(error);
  });

  test('rejects without waiting for slower items', async () => {
    const start = Date.now();
    await expect(promiseAll([delay(300, 'slow'), Promise.reject('fast fail')])).rejects.toBe('fast fail');
    expect(Date.now() - start).toBeLessThan(200);
  });

  test('adopts thenables', async () => {
    const thenable = { then: (onFulfilled) => onFulfilled('from thenable') };
    await expect(promiseAll([thenable])).resolves.toEqual(['from thenable']);
  });

  test('accepts any iterable', async () => {
    await expect(promiseAll(new Set([1, delay(10, 2)]))).resolves.toEqual([1, 2]);
    function* gen() {
      yield 'x';
      yield Promise.resolve('y');
    }
    await expect(promiseAll(gen())).resolves.toEqual(['x', 'y']);
  });

  test('rejects with a TypeError for a non-iterable instead of throwing', async () => {
    let result;
    expect(() => {
      result = promiseAll(42);
    }).not.toThrow();
    await expect(result).rejects.toBeInstanceOf(TypeError);
  });

  test('handles duplicate promises in the input', async () => {
    const p = delay(10, 'same');
    await expect(promiseAll([p, p])).resolves.toEqual(['same', 'same']);
  });
});
