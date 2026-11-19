import MyPromise from './index';

const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));

// Settles a MyPromise into a plain record without relying on `await` adoption details.
const outcome = (p) =>
  new Promise((resolve) => {
    p.then(
      (value) => resolve({ status: 'fulfilled', value }),
      (reason) => resolve({ status: 'rejected', reason })
    );
  });

describe('MyPromise', () => {
  describe('constructor', () => {
    test('calls the executor synchronously', () => {
      const executor = jest.fn();
      new MyPromise(executor);
      expect(executor).toHaveBeenCalledTimes(1);
      expect(typeof executor.mock.calls[0][0]).toBe('function');
      expect(typeof executor.mock.calls[0][1]).toBe('function');
    });

    test('throws a TypeError without an executor function', () => {
      expect(() => new MyPromise()).toThrow(TypeError);
      expect(() => new MyPromise(42)).toThrow(TypeError);
    });

    test('rejects when the executor throws', async () => {
      const error = new Error('executor');
      const p = new MyPromise(() => {
        throw error;
      });
      expect(await outcome(p)).toEqual({ status: 'rejected', reason: error });
    });

    test('only the first resolve/reject counts, and a later throw is ignored', async () => {
      const p = new MyPromise((resolve, reject) => {
        resolve('first');
        resolve('second');
        reject(new Error('ignored'));
        throw new Error('also ignored');
      });
      expect(await outcome(p)).toEqual({ status: 'fulfilled', value: 'first' });
    });
  });

  describe('then', () => {
    test('returns a new MyPromise', () => {
      const p = new MyPromise((r) => r(1));
      const child = p.then();
      expect(child).toBeInstanceOf(MyPromise);
      expect(child).not.toBe(p);
    });

    test('runs callbacks asynchronously, even when already settled', async () => {
      const onFulfilled = jest.fn();
      new MyPromise((r) => r('now')).then(onFulfilled);
      expect(onFulfilled).not.toHaveBeenCalled();
      await tick();
      expect(onFulfilled).toHaveBeenCalledWith('now');
    });

    test('runs callbacks as microtasks, before timers', async () => {
      const order = [];
      setTimeout(() => order.push('timeout'), 0);
      new MyPromise((r) => r()).then(() => order.push('then'));
      await tick(10);
      expect(order).toEqual(['then', 'timeout']);
    });

    test('chains and transforms values', async () => {
      const p = new MyPromise((r) => setTimeout(() => r(2), 5))
        .then((n) => n * 10)
        .then((n) => n + 1);
      expect(await outcome(p)).toEqual({ status: 'fulfilled', value: 21 });
    });

    test('a throwing callback rejects the returned promise', async () => {
      const error = new Error('in then');
      const p = new MyPromise((r) => r(1)).then(() => {
        throw error;
      });
      expect(await outcome(p)).toEqual({ status: 'rejected', reason: error });
    });

    test('passes values and reasons through when callbacks are missing', async () => {
      const fulfilled = new MyPromise((r) => r('v')).then().then(null, null);
      expect(await outcome(fulfilled)).toEqual({ status: 'fulfilled', value: 'v' });

      const rejected = new MyPromise((_, j) => j('r')).then((v) => v);
      expect(await outcome(rejected)).toEqual({ status: 'rejected', reason: 'r' });
    });

    test('calls multiple handlers on the same promise in registration order', async () => {
      const order = [];
      let resolve;
      const p = new MyPromise((r) => {
        resolve = r;
      });
      p.then(() => order.push(1));
      p.then(() => order.push(2));
      resolve();
      p.then(() => order.push(3));
      await tick();
      expect(order).toEqual([1, 2, 3]);
    });
  });

  describe('resolution and adoption', () => {
    test('adopts a returned MyPromise', async () => {
      const p = new MyPromise((r) => r(1)).then(
        (n) => new MyPromise((r) => setTimeout(() => r(n + 1), 5))
      );
      expect(await outcome(p)).toEqual({ status: 'fulfilled', value: 2 });
    });

    test('adopts native promises and plain thenables', async () => {
      const fromNative = new MyPromise((r) => r(Promise.resolve('native')));
      expect(await outcome(fromNative)).toEqual({ status: 'fulfilled', value: 'native' });

      const fromThenable = new MyPromise((r) => r({ then: (_, reject) => reject('thenable no') }));
      expect(await outcome(fromThenable)).toEqual({ status: 'rejected', reason: 'thenable no' });
    });

    test('rejects when reading or calling `then` throws', async () => {
      const getterError = new Error('getter');
      const badGetter = new MyPromise((r) =>
        r({
          get then() {
            throw getterError;
          },
        })
      );
      expect(await outcome(badGetter)).toEqual({ status: 'rejected', reason: getterError });

      const callError = new Error('call');
      const badCall = new MyPromise((r) =>
        r({
          then() {
            throw callError;
          },
        })
      );
      expect(await outcome(badCall)).toEqual({ status: 'rejected', reason: callError });
    });

    test('ignores reject after resolving with a pending thenable', async () => {
      const p = new MyPromise((resolve, reject) => {
        resolve({ then: (r) => setTimeout(() => r('adopted'), 5) });
        reject(new Error('too late'));
      });
      expect(await outcome(p)).toEqual({ status: 'fulfilled', value: 'adopted' });
    });

    test('rejects with a TypeError when resolved with itself', async () => {
      const p = new MyPromise((r) => r(1));
      const child = p.then(() => child);
      const result = await outcome(child);
      expect(result.status).toBe('rejected');
      expect(result.reason).toBeInstanceOf(TypeError);
    });
  });

  describe('catch', () => {
    test('handles rejections and recovers the chain', async () => {
      const p = new MyPromise((_, reject) => reject(new Error('oops')))
        .catch((e) => `handled ${e.message}`)
        .then((v) => v.toUpperCase());
      expect(await outcome(p)).toEqual({ status: 'fulfilled', value: 'HANDLED OOPS' });
    });
  });

  describe('finally', () => {
    test('runs with no arguments and passes the value through', async () => {
      const onFinally = jest.fn(() => 'ignored');
      const p = new MyPromise((r) => r('value')).finally(onFinally);
      expect(await outcome(p)).toEqual({ status: 'fulfilled', value: 'value' });
      expect(onFinally).toHaveBeenCalledWith();
    });

    test('passes the rejection reason through', async () => {
      const p = new MyPromise((_, j) => j('reason')).finally(() => {});
      expect(await outcome(p)).toEqual({ status: 'rejected', reason: 'reason' });
    });

    test('waits for a promise returned by onFinally', async () => {
      const order = [];
      const p = new MyPromise((r) => r('v'))
        .finally(
          () =>
            new MyPromise((r) =>
              setTimeout(() => {
                order.push('cleanup');
                r();
              }, 10)
            )
        )
        .then((v) => order.push(v));
      await outcome(p);
      expect(order).toEqual(['cleanup', 'v']);
    });

    test('a throw in onFinally overrides the outcome', async () => {
      const error = new Error('cleanup failed');
      const p = new MyPromise((r) => r('v')).finally(() => {
        throw error;
      });
      expect(await outcome(p)).toEqual({ status: 'rejected', reason: error });
    });
  });

  describe('statics', () => {
    test('MyPromise.resolve wraps values and returns MyPromise instances as-is', async () => {
      const existing = new MyPromise((r) => r(1));
      expect(MyPromise.resolve(existing)).toBe(existing);
      const wrapped = MyPromise.resolve(5);
      expect(wrapped).toBeInstanceOf(MyPromise);
      expect(await outcome(wrapped)).toEqual({ status: 'fulfilled', value: 5 });
    });

    test('MyPromise.reject does not unwrap its reason', async () => {
      const inner = new MyPromise((r) => r('inner'));
      const p = MyPromise.reject(inner);
      const result = await outcome(p);
      expect(result.status).toBe('rejected');
      expect(result.reason).toBe(inner);
    });
  });

  test('works with await', async () => {
    const value = await new MyPromise((r) => setTimeout(() => r('awaited'), 5));
    expect(value).toBe('awaited');
  });
});
