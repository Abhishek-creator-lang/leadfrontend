import series from './index';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

describe('series', () => {
  test('resolves an empty list to []', async () => {
    await expect(series([])).resolves.toEqual([]);
  });

  test('collects every result in order', async () => {
    const result = await series([async () => 1, async () => 2, async () => 3]);
    expect(result).toEqual([1, 2, 3]);
  });

  test('passes the previous result to the next task', async () => {
    const result = await series([
      async (prev) => (prev === undefined ? 1 : -1),
      async (prev) => prev + 10,
      (prev) => prev * 2,
    ]);
    expect(result).toEqual([1, 11, 22]);
  });

  test('runs tasks one at a time', async () => {
    let active = 0;
    let maxActive = 0;
    const task = async () => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await sleep(10);
      active -= 1;
    };
    await series([task, task, task, task]);
    expect(maxActive).toBe(1);
  });

  test('preserves start order even when earlier tasks are slower', async () => {
    const log = [];
    const make = (name, ms) => async () => {
      log.push(`start ${name}`);
      await sleep(ms);
      log.push(`end ${name}`);
    };
    await series([make('a', 30), make('b', 1), make('c', 10)]);
    expect(log).toEqual(['start a', 'end a', 'start b', 'end b', 'start c', 'end c']);
  });

  test('does not call any task synchronously except possibly the first', () => {
    const second = jest.fn();
    series([() => sleep(10), second]);
    expect(second).not.toHaveBeenCalled();
  });

  test('accepts synchronous tasks', async () => {
    await expect(series([() => 'a', (p) => p + 'b'])).resolves.toEqual(['a', 'ab']);
  });

  test('rejects with the first error and skips the remaining tasks', async () => {
    const after = jest.fn();
    const promise = series([
      async () => 1,
      async () => {
        throw new Error('step 2 failed');
      },
      after,
    ]);
    await expect(promise).rejects.toThrow('step 2 failed');
    expect(after).not.toHaveBeenCalled();
  });

  test('turns a synchronous throw into a rejection', async () => {
    let result;
    expect(() => {
      result = series([
        () => {
          throw new Error('sync');
        },
      ]);
    }).not.toThrow();
    await expect(result).rejects.toThrow('sync');
  });

  test('takes roughly the sum of the task durations', async () => {
    const start = Date.now();
    await series([() => sleep(30), () => sleep(30), () => sleep(30)]);
    expect(Date.now() - start).toBeGreaterThanOrEqual(80);
  });
});
