import promiseReject from './index';

describe('promiseReject', () => {
  test('returns a promise rejected with the reason', async () => {
    const error = new Error('nope');
    const p = promiseReject(error);
    expect(p).toBeInstanceOf(Promise);
    await expect(p).rejects.toBe(error);
  });

  test('accepts any value as the reason, including undefined', async () => {
    await expect(promiseReject('text')).rejects.toBe('text');
    await expect(promiseReject(undefined)).rejects.toBeUndefined();
  });

  test('does not unwrap a promise reason', async () => {
    const inner = Promise.resolve('fine');
    await expect(promiseReject(inner)).rejects.toBe(inner);
  });

  test('always returns a new promise', () => {
    const inner = Promise.reject(new Error('inner'));
    inner.catch(() => {});
    const outer = promiseReject(inner);
    outer.catch(() => {});
    expect(outer).not.toBe(inner);
  });

  test('does not adopt or call a thenable reason', async () => {
    const then = jest.fn((resolve) => resolve('ignored'));
    const thenable = { then };
    await expect(promiseReject(thenable)).rejects.toBe(thenable);
    expect(then).not.toHaveBeenCalled();
  });

  test('settles asynchronously for handlers', async () => {
    const onRejected = jest.fn();
    promiseReject('later').catch(onRejected);
    expect(onRejected).not.toHaveBeenCalled();
    await new Promise((r) => setTimeout(r, 0));
    expect(onRejected).toHaveBeenCalledWith('later');
  });
});
