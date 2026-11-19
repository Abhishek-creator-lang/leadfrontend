import retry from './index';

function failTimes(n, value = 'ok') {
  let calls = 0;
  return jest.fn(async () => {
    calls += 1;
    if (calls <= n) throw new Error(`fail ${calls}`);
    return value;
  });
}

describe('retry', () => {
  test('resolves with the result when the first attempt succeeds', async () => {
    const fn = jest.fn(async () => 42);
    await expect(retry(fn, { baseDelay: 1 })).resolves.toBe(42);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('retries until it succeeds', async () => {
    const fn = failTimes(2, 'finally');
    await expect(retry(fn, { retries: 3, baseDelay: 1 })).resolves.toBe('finally');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('passes the 1-based attempt number', async () => {
    const fn = failTimes(2);
    await retry(fn, { retries: 3, baseDelay: 1 });
    expect(fn.mock.calls).toEqual([[1], [2], [3]]);
  });

  test('rejects with the last error after running out of retries', async () => {
    const fn = failTimes(10);
    await expect(retry(fn, { retries: 2, baseDelay: 1 })).rejects.toThrow('fail 3');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('retries: 0 calls exactly once', async () => {
    const fn = failTimes(5);
    await expect(retry(fn, { retries: 0, baseDelay: 1 })).rejects.toThrow('fail 1');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('defaults to 3 retries', async () => {
    const fn = failTimes(10);
    await expect(retry(fn, { baseDelay: 1 })).rejects.toThrow('fail 4');
    expect(fn).toHaveBeenCalledTimes(4);
  });

  test('a synchronous throw is retried', async () => {
    let calls = 0;
    const fn = () => {
      calls += 1;
      if (calls === 1) throw new Error('sync');
      return 'recovered';
    };
    await expect(retry(fn, { baseDelay: 1 })).resolves.toBe('recovered');
  });

  test('stops when shouldRetry returns false', async () => {
    const fn = jest.fn(async () => {
      const e = new Error('not found');
      e.status = 404;
      throw e;
    });
    const shouldRetry = jest.fn((error) => error.status !== 404);
    await expect(retry(fn, { retries: 5, baseDelay: 1, shouldRetry })).rejects.toThrow('not found');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(shouldRetry).toHaveBeenCalledWith(expect.any(Error), 1);
  });

  test('waits with exponential backoff between attempts', async () => {
    const times = [];
    const fn = async () => {
      times.push(Date.now());
      throw new Error('x');
    };
    await expect(retry(fn, { retries: 3, baseDelay: 20, factor: 2 })).rejects.toThrow();
    const gaps = times.slice(1).map((t, i) => t - times[i]);
    // Expected delays: 20, 40, 80 (allow small timer jitter).
    expect(gaps[0]).toBeGreaterThanOrEqual(15);
    expect(gaps[1]).toBeGreaterThanOrEqual(35);
    expect(gaps[2]).toBeGreaterThanOrEqual(70);
    expect(gaps[2]).toBeGreaterThan(gaps[0] + 30);
  });

  test('caps each delay at maxDelay', async () => {
    const fn = failTimes(10);
    const start = Date.now();
    await expect(retry(fn, { retries: 4, baseDelay: 20, factor: 10, maxDelay: 25 })).rejects.toThrow();
    // Without the cap this would wait 20 + 200 + 2000 + ... ms.
    expect(Date.now() - start).toBeLessThan(400);
  });

  test('does not start the next attempt before the previous one settles', async () => {
    let active = 0;
    let maxActive = 0;
    let calls = 0;
    const fn = async () => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await new Promise((r) => setTimeout(r, 15));
      active -= 1;
      calls += 1;
      if (calls < 3) throw new Error('again');
      return 'ok';
    };
    await retry(fn, { baseDelay: 1 });
    expect(maxActive).toBe(1);
  });
});
