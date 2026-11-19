import createPriorityQueue from './index';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function recorder(order) {
  return (name, ms = 5) => async () => {
    order.push(name);
    await sleep(ms);
    return name;
  };
}

describe('createPriorityQueue', () => {
  test('resolves with the task result', async () => {
    const q = createPriorityQueue(1);
    await expect(q.add(async () => 'value')).resolves.toBe('value');
    await expect(q.add(() => 3)).resolves.toBe(3);
  });

  test('starts a task synchronously when a slot is free', () => {
    const q = createPriorityQueue(2);
    const task = jest.fn(() => sleep(10));
    q.add(task);
    expect(task).toHaveBeenCalledTimes(1);
    expect(q.running).toBe(1);
    expect(q.size).toBe(0);
  });

  test('starts higher-priority waiting tasks first', async () => {
    const q = createPriorityQueue(1);
    const order = [];
    const t = recorder(order);
    const all = [q.add(t('blocker', 20)), q.add(t('low'), 1), q.add(t('high'), 10), q.add(t('mid'), 5)];
    expect(q.size).toBe(3);
    await Promise.all(all);
    expect(order).toEqual(['blocker', 'high', 'mid', 'low']);
  });

  test('keeps FIFO order within the same priority', async () => {
    const q = createPriorityQueue(1);
    const order = [];
    const t = recorder(order);
    const all = [
      q.add(t('blocker', 20)),
      q.add(t('a'), 3),
      q.add(t('b'), 3),
      q.add(t('c'), 7),
      q.add(t('d'), 3),
      q.add(t('e'), 7),
      q.add(t('f'), 3),
    ];
    await Promise.all(all);
    expect(order).toEqual(['blocker', 'c', 'e', 'a', 'b', 'd', 'f']);
  });

  test('default priority is 0 and negative priorities run last', async () => {
    const q = createPriorityQueue(1);
    const order = [];
    const t = recorder(order);
    await Promise.all([q.add(t('blocker', 15)), q.add(t('neg'), -1), q.add(t('default')), q.add(t('pos'), 1)]);
    expect(order).toEqual(['blocker', 'pos', 'default', 'neg']);
  });

  test('respects the concurrency limit', async () => {
    const q = createPriorityQueue(2);
    let active = 0;
    let maxActive = 0;
    const task = async () => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await sleep(10);
      active -= 1;
    };
    await Promise.all(Array.from({ length: 8 }, (_, i) => q.add(task, i % 3)));
    expect(maxActive).toBe(2);
  });

  test('tasks added while others run are still ordered by priority', async () => {
    const q = createPriorityQueue(1);
    const order = [];
    const t = recorder(order);
    const first = q.add(t('first', 20));
    const later = [q.add(t('low'), 0)];
    await sleep(5);
    later.push(q.add(t('urgent'), 100));
    await Promise.all([first, ...later]);
    expect(order).toEqual(['first', 'urgent', 'low']);
  });

  test('a rejected task rejects its own promise and frees the slot', async () => {
    const q = createPriorityQueue(1);
    const bad = q.add(() => Promise.reject(new Error('bad')));
    const good = q.add(async () => 'good');
    await expect(bad).rejects.toThrow('bad');
    await expect(good).resolves.toBe('good');
    expect(q.running).toBe(0);
  });

  test('a synchronous throw is treated as a rejection', async () => {
    const q = createPriorityQueue(1);
    const bad = q.add(() => {
      throw new Error('sync');
    });
    await expect(bad).rejects.toThrow('sync');
    await expect(q.add(() => 'after')).resolves.toBe('after');
  });

  test('handles many tasks in correct priority order', async () => {
    const q = createPriorityQueue(1);
    const order = [];
    const blocker = q.add(() => sleep(20));
    const priorities = [5, 1, 9, 3, 7, 2, 8, 6, 4, 0];
    const all = priorities.map((p) =>
      q.add(async () => {
        order.push(p);
      }, p)
    );
    await Promise.all([blocker, ...all]);
    expect(order).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1, 0]);
  });
});
