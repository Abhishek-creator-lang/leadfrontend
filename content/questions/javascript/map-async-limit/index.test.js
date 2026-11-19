import mapAsyncLimit from './index';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function tracker() {
  let active = 0;
  let maxActive = 0;
  return {
    async run(fn) {
      active += 1;
      maxActive = Math.max(maxActive, active);
      try {
        return await fn();
      } finally {
        active -= 1;
      }
    },
    get maxActive() {
      return maxActive;
    },
  };
}

describe('mapAsyncLimit', () => {
  test('resolves an empty array to []', async () => {
    await expect(mapAsyncLimit([], 2, (x) => x)).resolves.toEqual([]);
  });

  test('maps values in input order', async () => {
    const result = await mapAsyncLimit([30, 5, 15, 1], 2, async (ms) => {
      await sleep(ms);
      return ms * 2;
    });
    expect(result).toEqual([60, 10, 30, 2]);
  });

  test('never exceeds the limit', async () => {
    const t = tracker();
    await mapAsyncLimit([1, 2, 3, 4, 5, 6, 7], 3, () => t.run(() => sleep(15)));
    expect(t.maxActive).toBe(3);
  });

  test('limit of 1 runs strictly in series', async () => {
    const t = tracker();
    const order = [];
    await mapAsyncLimit([20, 1, 10], 1, (ms, i) =>
      t.run(async () => {
        await sleep(ms);
        order.push(i);
      })
    );
    expect(t.maxActive).toBe(1);
    expect(order).toEqual([0, 1, 2]);
  });

  test('starts only `limit` calls synchronously', () => {
    const cb = jest.fn(() => sleep(20));
    mapAsyncLimit([1, 2, 3, 4], 2, cb);
    expect(cb).toHaveBeenCalledTimes(2);
    expect(cb.mock.calls).toEqual([
      [1, 0],
      [2, 1],
    ]);
  });

  test('a limit larger than the input starts everything', () => {
    const cb = jest.fn(() => sleep(10));
    mapAsyncLimit(['a', 'b'], 10, cb);
    expect(cb).toHaveBeenCalledTimes(2);
  });

  test('starts the next item as soon as a slot frees up (sliding window)', async () => {
    const started = [];
    const start = Date.now();
    await mapAsyncLimit([80, 10, 10, 10], 2, async (ms, i) => {
      started.push([i, Date.now() - start]);
      await sleep(ms);
    });
    // Item 2 must start well before the slow item 0 finishes.
    const item2Start = started.find(([i]) => i === 2)[1];
    expect(item2Start).toBeLessThan(60);
  });

  test('accepts plain return values', async () => {
    await expect(mapAsyncLimit([1, 2, 3], 2, (n) => n + 1)).resolves.toEqual([2, 3, 4]);
  });

  test('rejects on the first failure', async () => {
    const promise = mapAsyncLimit([1, 2, 3], 2, async (n) => {
      await sleep(5);
      if (n === 2) throw new Error('nope');
      return n;
    });
    await expect(promise).rejects.toThrow('nope');
  });

  test('does not start new items after a failure', async () => {
    const cb = jest.fn(async (n) => {
      await sleep(10);
      if (n === 1) throw new Error('fail');
      return n;
    });
    await expect(mapAsyncLimit([1, 2, 3, 4, 5], 1, cb)).rejects.toThrow('fail');
    await sleep(50);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  test('a synchronous throw becomes a rejection', async () => {
    const promise = mapAsyncLimit([1, 2], 1, () => {
      throw new Error('sync');
    });
    await expect(promise).rejects.toThrow('sync');
  });
});
