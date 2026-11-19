import promiseTimeout from './index';

const delay = (ms, value, fail = false) =>
  new Promise((resolve, reject) => setTimeout(() => (fail ? reject(value) : resolve(value)), ms));

describe('promiseTimeout', () => {
  test('returns a promise', () => {
    const p = promiseTimeout(Promise.resolve(1), 100);
    expect(p).toBeInstanceOf(Promise);
  });

  test('resolves with the value when the input is fast enough', async () => {
    await expect(promiseTimeout(delay(10, 'ok'), 200)).resolves.toBe('ok');
  });

  test('rejects with the original reason when the input rejects in time', async () => {
    const error = new Error('real failure');
    await expect(promiseTimeout(delay(10, error, true), 200)).rejects.toBe(error);
  });

  test('rejects with a TimeoutError when the input is too slow', async () => {
    let caught;
    try {
      await promiseTimeout(delay(200, 'late'), 20);
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(Error);
    expect(caught.name).toBe('TimeoutError');
    expect(caught.message).toContain('20');
  });

  test('times out without waiting for the slow input', async () => {
    const start = Date.now();
    await expect(promiseTimeout(delay(400, 'late'), 20)).rejects.toBeInstanceOf(Error);
    expect(Date.now() - start).toBeLessThan(250);
  });

  test('ignores the input settling after the timeout', async () => {
    const onFulfilled = jest.fn();
    const result = promiseTimeout(delay(40, 'late'), 10).then(onFulfilled, () => 'timed out');
    await expect(result).resolves.toBe('timed out');
    await delay(60);
    expect(onFulfilled).not.toHaveBeenCalled();
  });

  test('accepts plain values', async () => {
    await expect(promiseTimeout('plain', 50)).resolves.toBe('plain');
  });

  test('an already-resolved input beats a zero timeout', async () => {
    await expect(promiseTimeout(Promise.resolve('instant'), 0)).resolves.toBe('instant');
  });

  test('accepts thenables', async () => {
    const thenable = { then: (resolve) => setTimeout(() => resolve('thenable'), 5) };
    await expect(promiseTimeout(thenable, 100)).resolves.toBe('thenable');
  });
});
