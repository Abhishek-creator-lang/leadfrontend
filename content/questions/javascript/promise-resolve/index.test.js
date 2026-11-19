import promiseResolve from './index';

describe('promiseResolve', () => {
  test('wraps a plain value in a fulfilled promise', async () => {
    const p = promiseResolve(42);
    expect(p).toBeInstanceOf(Promise);
    await expect(p).resolves.toBe(42);
  });

  test('fulfills with null, undefined and objects as-is', async () => {
    const obj = { then: 'not a function' };
    await expect(promiseResolve(null)).resolves.toBeNull();
    await expect(promiseResolve(undefined)).resolves.toBeUndefined();
    await expect(promiseResolve(obj)).resolves.toBe(obj);
  });

  test('returns a native promise unchanged', () => {
    const p = Promise.resolve('x');
    expect(promiseResolve(p)).toBe(p);
    const rejected = Promise.reject(new Error('r'));
    rejected.catch(() => {});
    expect(promiseResolve(rejected)).toBe(rejected);
  });

  test('wraps promise subclasses in a new native promise', async () => {
    class MyPromise extends Promise {}
    const sub = MyPromise.resolve('sub');
    const result = promiseResolve(sub);
    expect(result).not.toBe(sub);
    expect(result.constructor).toBe(Promise);
    await expect(result).resolves.toBe('sub');
  });

  test('adopts a fulfilling thenable', async () => {
    const thenable = { then: (onFulfilled) => onFulfilled('adopted') };
    await expect(promiseResolve(thenable)).resolves.toBe('adopted');
  });

  test('adopts a rejecting thenable', async () => {
    const thenable = { then: (_, onRejected) => onRejected('nope') };
    await expect(promiseResolve(thenable)).rejects.toBe('nope');
  });

  test('rejects when `then` throws before settling', async () => {
    const error = new Error('then threw');
    const thenable = {
      then() {
        throw error;
      },
    };
    await expect(promiseResolve(thenable)).rejects.toBe(error);
  });

  test('ignores a throw after the thenable already settled', async () => {
    const thenable = {
      then(onFulfilled) {
        onFulfilled('first');
        throw new Error('ignored');
      },
    };
    await expect(promiseResolve(thenable)).resolves.toBe('first');
  });

  test('rejects when reading `then` throws', async () => {
    const error = new Error('getter');
    const thenable = {
      get then() {
        throw error;
      },
    };
    await expect(promiseResolve(thenable)).rejects.toBe(error);
  });

  test('calls `then` asynchronously', async () => {
    const then = jest.fn((onFulfilled) => onFulfilled(1));
    const p = promiseResolve({ then });
    expect(then).not.toHaveBeenCalled();
    await p;
    expect(then).toHaveBeenCalledTimes(1);
  });

  test('flattens nested thenables', async () => {
    const inner = { then: (r) => r('deep') };
    const outer = { then: (r) => r(inner) };
    await expect(promiseResolve(outer)).resolves.toBe('deep');
  });
});
