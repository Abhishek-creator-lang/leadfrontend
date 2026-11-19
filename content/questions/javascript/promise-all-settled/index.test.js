import promiseAllSettled from './index';

const delay = (ms, value, fail = false) =>
  new Promise((resolve, reject) => setTimeout(() => (fail ? reject(value) : resolve(value)), ms));

describe('promiseAllSettled', () => {
  test('returns a promise', () => {
    expect(promiseAllSettled([])).toBeInstanceOf(Promise);
  });

  test('reports fulfilled and rejected outcomes', async () => {
    const error = new Error('nope');
    const results = await promiseAllSettled([Promise.resolve(1), Promise.reject(error)]);
    expect(results).toEqual([
      { status: 'fulfilled', value: 1 },
      { status: 'rejected', reason: error },
    ]);
  });

  test('keeps input order regardless of completion order', async () => {
    const results = await promiseAllSettled([delay(40, 'slow'), delay(5, 'fast', true), delay(20, 'mid')]);
    expect(results.map((r) => r.status)).toEqual(['fulfilled', 'rejected', 'fulfilled']);
    expect(results[0].value).toBe('slow');
    expect(results[1].reason).toBe('fast');
  });

  test('never rejects, even when everything fails', async () => {
    const results = await promiseAllSettled([Promise.reject('a'), Promise.reject('b')]);
    expect(results).toEqual([
      { status: 'rejected', reason: 'a' },
      { status: 'rejected', reason: 'b' },
    ]);
  });

  test('waits for every item to settle', async () => {
    const start = Date.now();
    await promiseAllSettled([Promise.reject('early'), delay(60, 'late')]);
    expect(Date.now() - start).toBeGreaterThanOrEqual(50);
  });

  test('outcome objects have only the expected keys', async () => {
    const [ok, bad] = await promiseAllSettled([1, Promise.reject(undefined)]);
    expect(Object.keys(ok).sort()).toEqual(['status', 'value']);
    expect(Object.keys(bad).sort()).toEqual(['reason', 'status']);
    expect(bad.reason).toBeUndefined();
  });

  test('treats plain values as fulfilled and adopts thenables', async () => {
    const thenable = { then: (_, onRejected) => onRejected('thenable failed') };
    await expect(promiseAllSettled(['plain', thenable])).resolves.toEqual([
      { status: 'fulfilled', value: 'plain' },
      { status: 'rejected', reason: 'thenable failed' },
    ]);
  });

  test('resolves an empty iterable with an empty array', async () => {
    await expect(promiseAllSettled([])).resolves.toEqual([]);
  });

  test('accepts any iterable', async () => {
    await expect(promiseAllSettled(new Set([1]))).resolves.toEqual([{ status: 'fulfilled', value: 1 }]);
  });

  test('rejects with a TypeError for a non-iterable', async () => {
    await expect(promiseAllSettled(undefined)).rejects.toBeInstanceOf(TypeError);
  });
});
