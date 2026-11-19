import sleep from './index';

describe('sleep', () => {
  test('returns a promise', () => {
    const p = sleep(1);
    expect(p).toBeInstanceOf(Promise);
    return p;
  });

  test('fulfills with undefined', async () => {
    await expect(sleep(1)).resolves.toBeUndefined();
  });

  test('waits at least the given duration', async () => {
    const start = Date.now();
    await sleep(50);
    // Small tolerance for timer granularity.
    expect(Date.now() - start).toBeGreaterThanOrEqual(45);
  });

  test('does not fulfill synchronously, even with the default duration', async () => {
    const onDone = jest.fn();
    sleep().then(onDone);
    await Promise.resolve();
    expect(onDone).not.toHaveBeenCalled();
    await new Promise((r) => setTimeout(r, 20));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  test('does not block other code', async () => {
    const order = [];
    const pending = sleep(40).then(() => order.push('sleep'));
    setTimeout(() => order.push('timer'), 5);
    order.push('sync');
    await pending;
    expect(order).toEqual(['sync', 'timer', 'sleep']);
  });

  test('concurrent sleeps run in parallel, not in series', async () => {
    const start = Date.now();
    await Promise.all([sleep(60), sleep(60), sleep(60)]);
    expect(Date.now() - start).toBeLessThan(150);
  });
});
