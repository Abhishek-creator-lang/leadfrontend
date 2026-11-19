import createPool from './index';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

describe('createPool', () => {
  test('add resolves with the task result', async () => {
    const pool = createPool(2);
    await expect(pool.add(async () => 'done')).resolves.toBe('done');
    await expect(pool.add(() => 7)).resolves.toBe(7);
  });

  test('starts tasks synchronously while slots are free', () => {
    const pool = createPool(2);
    const t1 = jest.fn(() => sleep(20));
    const t2 = jest.fn(() => sleep(20));
    const t3 = jest.fn(() => sleep(20));
    pool.add(t1);
    pool.add(t2);
    pool.add(t3);
    expect(t1).toHaveBeenCalledTimes(1);
    expect(t2).toHaveBeenCalledTimes(1);
    expect(t3).not.toHaveBeenCalled();
    expect(pool.running).toBe(2);
    expect(pool.pending).toBe(1);
  });

  test('never runs more than `concurrency` tasks', async () => {
    const pool = createPool(3);
    let active = 0;
    let maxActive = 0;
    const task = async () => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await sleep(10);
      active -= 1;
    };
    const all = Array.from({ length: 10 }, () => pool.add(task));
    await Promise.all(all);
    expect(maxActive).toBe(3);
  });

  test('starts queued tasks in FIFO order', async () => {
    const pool = createPool(1);
    const order = [];
    const make = (name, ms) => async () => {
      order.push(name);
      await sleep(ms);
    };
    await Promise.all([pool.add(make('a', 10)), pool.add(make('b', 1)), pool.add(make('c', 1))]);
    expect(order).toEqual(['a', 'b', 'c']);
  });

  test('a rejected task rejects only its own promise', async () => {
    const pool = createPool(1);
    const bad = pool.add(async () => {
      throw new Error('bad');
    });
    const good = pool.add(async () => 'good');
    await expect(bad).rejects.toThrow('bad');
    await expect(good).resolves.toBe('good');
  });

  test('a synchronous throw is treated as a rejection and frees the slot', async () => {
    const pool = createPool(1);
    const bad = pool.add(() => {
      throw new Error('sync');
    });
    await expect(bad).rejects.toThrow('sync');
    await expect(pool.add(() => 'next')).resolves.toBe('next');
  });

  test('failures do not leak slots', async () => {
    const pool = createPool(2);
    const failures = Array.from({ length: 4 }, () => pool.add(() => Promise.reject(new Error('x'))).catch(() => 'caught'));
    await Promise.all(failures);
    expect(pool.running).toBe(0);
    await expect(pool.add(() => 'ok')).resolves.toBe('ok');
  });

  test('accepts tasks added later', async () => {
    const pool = createPool(1);
    await pool.add(() => sleep(5));
    expect(pool.running).toBe(0);
    await expect(pool.add(() => 'later')).resolves.toBe('later');
  });

  test('onIdle resolves immediately for an idle pool', async () => {
    const pool = createPool(2);
    await expect(pool.onIdle()).resolves.toBeUndefined();
  });

  test('onIdle waits for running and queued tasks', async () => {
    const pool = createPool(1);
    const done = [];
    pool.add(async () => {
      await sleep(15);
      done.push(1);
    });
    pool.add(async () => {
      await sleep(15);
      done.push(2);
    });
    await pool.onIdle();
    expect(done).toEqual([1, 2]);
    expect(pool.running).toBe(0);
    expect(pool.pending).toBe(0);
  });

  test('onIdle waits for tasks added by other tasks', async () => {
    const pool = createPool(2);
    const done = [];
    pool.add(async () => {
      await sleep(5);
      pool.add(async () => {
        await sleep(10);
        done.push('child');
      });
      done.push('parent');
    });
    await pool.onIdle();
    expect(done).toEqual(['parent', 'child']);
  });
});
