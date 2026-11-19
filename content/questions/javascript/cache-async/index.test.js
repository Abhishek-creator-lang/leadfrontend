import cacheAsync from './index';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

describe('cacheAsync', () => {
  test('resolves with the function result', async () => {
    const cached = cacheAsync(async (x) => x * 2);
    await expect(cached(4)).resolves.toBe(8);
  });

  test('deduplicates concurrent calls with the same arguments', async () => {
    const fn = jest.fn(async (id) => {
      await sleep(10);
      return { id };
    });
    const cached = cacheAsync(fn);
    const a = cached(1);
    const b = cached(1);
    expect(a).toBe(b);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(await a).toEqual({ id: 1 });
  });

  test('different arguments get different entries', async () => {
    const fn = jest.fn(async (id) => id);
    const cached = cacheAsync(fn);
    await Promise.all([cached(1), cached(2), cached(1)]);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('keeps the resolved value cached (default ttl is Infinity)', async () => {
    const fn = jest.fn(async () => 'v');
    const cached = cacheAsync(fn);
    await cached('k');
    await sleep(20);
    await expect(cached('k')).resolves.toBe('v');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('expires entries ttl ms after they resolve', async () => {
    const fn = jest.fn(async () => {
      await sleep(40);
      return 'v';
    });
    const cached = cacheAsync(fn, { ttl: 30 });
    await cached();
    // The TTL starts at resolution, so a slow request is still cached right after it resolves.
    await cached();
    expect(fn).toHaveBeenCalledTimes(1);
    await sleep(60);
    await cached();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('does not cache rejections', async () => {
    let calls = 0;
    const cached = cacheAsync(async () => {
      calls += 1;
      if (calls === 1) throw new Error('flaky');
      return 'ok';
    });
    await expect(cached()).rejects.toThrow('flaky');
    await expect(cached()).resolves.toBe('ok');
    expect(calls).toBe(2);
  });

  test('concurrent callers share the same rejection', async () => {
    const fn = jest.fn(async () => {
      await sleep(5);
      throw new Error('down');
    });
    const cached = cacheAsync(fn);
    const results = await Promise.allSettled([cached(), cached()]);
    expect(results.map((r) => r.status)).toEqual(['rejected', 'rejected']);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('always returns a promise, even when fn throws synchronously', async () => {
    const cached = cacheAsync(() => {
      throw new Error('sync');
    });
    const result = cached();
    expect(result).toBeInstanceOf(Promise);
    await expect(result).rejects.toThrow('sync');
  });

  test('supports a custom key function', async () => {
    const fn = jest.fn(async (user) => user.name);
    const cached = cacheAsync(fn, { key: (user) => String(user.id) });
    await cached({ id: 1, name: 'Ada' });
    await expect(cached({ id: 1, name: 'ignored' })).resolves.toBe('Ada');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('forwards `this`', async () => {
    const api = {
      base: '/v1',
      get: cacheAsync(async function (path) {
        return this.base + path;
      }),
    };
    await expect(api.get('/users')).resolves.toBe('/v1/users');
  });

  test('clear() and delete() drop entries', async () => {
    const fn = jest.fn(async (x) => x);
    const cached = cacheAsync(fn);
    await cached(1);
    await cached(2);
    cached.delete(1);
    await cached(1);
    await cached(2);
    expect(fn).toHaveBeenCalledTimes(3);
    cached.clear();
    await cached(2);
    expect(fn).toHaveBeenCalledTimes(4);
  });

  test('a stale rejection does not evict a newer entry', async () => {
    let calls = 0;
    const fn = jest.fn(async () => {
      calls += 1;
      const n = calls;
      await sleep(n === 1 ? 20 : 5);
      if (n === 1) throw new Error('old failed');
      return 'fresh';
    });
    const cached = cacheAsync(fn);
    const first = cached('k');
    cached.delete('k');
    const second = cached('k');
    await expect(second).resolves.toBe('fresh');
    await expect(first).rejects.toThrow('old failed');
    // The first request's failure must not have removed the second entry.
    await expect(cached('k')).resolves.toBe('fresh');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
