import promiseWithResolvers from './index';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

describe('promiseWithResolvers', () => {
  test('returns exactly promise, resolve and reject', () => {
    const result = promiseWithResolvers();
    expect(Object.keys(result).sort()).toEqual(['promise', 'reject', 'resolve']);
    expect(result.promise).toBeInstanceOf(Promise);
    expect(typeof result.resolve).toBe('function');
    expect(typeof result.reject).toBe('function');
  });

  test('the promise starts pending', async () => {
    const { promise } = promiseWithResolvers();
    const onSettled = jest.fn();
    promise.then(onSettled, onSettled);
    await sleep(10);
    expect(onSettled).not.toHaveBeenCalled();
  });

  test('resolve fulfills the promise from outside', async () => {
    const { promise, resolve } = promiseWithResolvers();
    setTimeout(() => resolve('done'), 10);
    await expect(promise).resolves.toBe('done');
  });

  test('reject rejects the promise from outside', async () => {
    const { promise, reject } = promiseWithResolvers();
    const error = new Error('fail');
    reject(error);
    await expect(promise).rejects.toBe(error);
  });

  test('only the first settlement counts', async () => {
    const { promise, resolve, reject } = promiseWithResolvers();
    resolve(1);
    resolve(2);
    reject(new Error('ignored'));
    await expect(promise).resolves.toBe(1);
  });

  test('resolve adopts promises and thenables', async () => {
    const a = promiseWithResolvers();
    a.resolve(Promise.resolve('from promise'));
    await expect(a.promise).resolves.toBe('from promise');

    const b = promiseWithResolvers();
    b.resolve({ then: (r) => r('from thenable') });
    await expect(b.promise).resolves.toBe('from thenable');
  });

  test('every call creates an independent promise', async () => {
    const first = promiseWithResolvers();
    const second = promiseWithResolvers();
    expect(first.promise).not.toBe(second.promise);
    first.resolve('one');
    second.resolve('two');
    await expect(first.promise).resolves.toBe('one');
    await expect(second.promise).resolves.toBe('two');
  });

  test('resolve and reject work when detached from the object', async () => {
    const { promise, resolve } = promiseWithResolvers();
    const callLater = (fn) => setTimeout(fn, 5, 'detached');
    callLater(resolve);
    await expect(promise).resolves.toBe('detached');
  });
});
