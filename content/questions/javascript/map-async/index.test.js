import mapAsync from './index';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

describe('mapAsync', () => {
  test('returns a promise', () => {
    const result = mapAsync([], (x) => x);
    expect(result).toBeInstanceOf(Promise);
  });

  test('resolves an empty array to []', async () => {
    await expect(mapAsync([], (x) => x)).resolves.toEqual([]);
  });

  test('maps with an async callback', async () => {
    const result = await mapAsync([1, 2, 3], async (n) => n * 10);
    expect(result).toEqual([10, 20, 30]);
  });

  test('keeps input order when calls finish out of order', async () => {
    const result = await mapAsync([30, 5, 15], async (ms) => {
      await sleep(ms);
      return ms;
    });
    expect(result).toEqual([30, 5, 15]);
  });

  test('accepts callbacks that return plain values', async () => {
    const result = await mapAsync(['a', 'b'], (s, i) => s + i);
    expect(result).toEqual(['a0', 'b1']);
  });

  test('passes the item and index, calling every callback synchronously', () => {
    const cb = jest.fn(() => sleep(10));
    mapAsync(['x', 'y', 'z'], cb);
    expect(cb).toHaveBeenCalledTimes(3);
    expect(cb.mock.calls).toEqual([
      ['x', 0],
      ['y', 1],
      ['z', 2],
    ]);
  });

  test('runs calls in parallel', async () => {
    const start = Date.now();
    await mapAsync([1, 2, 3, 4], () => sleep(50));
    expect(Date.now() - start).toBeLessThan(150);
  });

  test('rejects when one call rejects', async () => {
    const promise = mapAsync([1, 2, 3], async (n) => {
      if (n === 2) throw new Error('boom');
      return n;
    });
    await expect(promise).rejects.toThrow('boom');
  });

  test('a synchronous throw becomes a rejection', async () => {
    const promise = mapAsync([1], () => {
      throw new Error('sync');
    });
    await expect(promise).rejects.toThrow('sync');
  });

  test('rejects with the first rejection to happen', async () => {
    const promise = mapAsync([40, 10], async (ms) => {
      await sleep(ms);
      throw new Error(`failed after ${ms}`);
    });
    await expect(promise).rejects.toThrow('failed after 10');
  });

  test('keeps undefined results in place', async () => {
    const result = await mapAsync([1, 2, 3], async (n) => (n === 2 ? undefined : n));
    expect(result).toEqual([1, undefined, 3]);
    expect(result).toHaveLength(3);
  });
});
