import promiseAny from './index';

const delay = (ms, value, fail = false) =>
  new Promise((resolve, reject) => setTimeout(() => (fail ? reject(value) : resolve(value)), ms));

describe('promiseAny', () => {
  test('returns a promise', () => {
    const p = promiseAny([1]);
    expect(p).toBeInstanceOf(Promise);
  });

  test('fulfills with the first fulfilled value', async () => {
    await expect(promiseAny([delay(40, 'slow'), delay(10, 'fast')])).resolves.toBe('fast');
  });

  test('ignores rejections that happen before a fulfillment', async () => {
    await expect(promiseAny([delay(5, 'err', true), delay(30, 'ok')])).resolves.toBe('ok');
  });

  test('ignores rejections that happen after a fulfillment', async () => {
    await expect(promiseAny([delay(5, 'first'), delay(20, 'late', true)])).resolves.toBe('first');
  });

  test('rejects with an AggregateError when everything rejects', async () => {
    let caught;
    try {
      await promiseAny([Promise.reject(1), Promise.reject(2)]);
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(AggregateError);
    expect(caught.errors).toEqual([1, 2]);
  });

  test('orders errors by input position, not rejection time', async () => {
    let caught;
    try {
      await promiseAny([delay(40, 'a', true), delay(5, 'b', true), delay(20, 'c', true)]);
    } catch (e) {
      caught = e;
    }
    expect(caught.errors).toEqual(['a', 'b', 'c']);
  });

  test('rejects an empty iterable with an empty AggregateError', async () => {
    let caught;
    try {
      await promiseAny([]);
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(AggregateError);
    expect(caught.errors).toEqual([]);
  });

  test('treats plain values as fulfilled', async () => {
    await expect(promiseAny([Promise.reject('x'), 'plain'])).resolves.toBe('plain');
  });

  test('adopts thenables', async () => {
    const thenable = { then: (resolve) => setTimeout(() => resolve('thenable'), 5) };
    await expect(promiseAny([delay(50, 'slow'), thenable])).resolves.toBe('thenable');
  });

  test('rejects with a TypeError for a non-iterable', async () => {
    await expect(promiseAny(null)).rejects.toBeInstanceOf(TypeError);
  });
});
