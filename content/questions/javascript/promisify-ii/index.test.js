import promisify from './index';

describe('promisify (with custom symbol)', () => {
  test('exposes the registered custom symbol', () => {
    expect(promisify.custom).toBe(Symbol.for('nodejs.util.promisify.custom'));
  });

  test('promisifies a normal callback function', async () => {
    const add = (a, b, cb) => setTimeout(() => cb(null, a + b), 5);
    await expect(promisify(add)(2, 3)).resolves.toBe(5);
  });

  test('rejects on a truthy error', async () => {
    const fail = (cb) => cb(new Error('bad'));
    await expect(promisify(fail)()).rejects.toThrow('bad');
  });

  test('returns the custom implementation unchanged', async () => {
    function legacyStat(path, cb) {
      cb(null, 1024, 'file');
    }
    const custom = jest.fn(() => Promise.resolve({ size: 1024, type: 'file' }));
    legacyStat[promisify.custom] = custom;

    const stat = promisify(legacyStat);
    expect(stat).toBe(custom);
    await expect(stat('/tmp/a')).resolves.toEqual({ size: 1024, type: 'file' });
    expect(custom).toHaveBeenCalledWith('/tmp/a');
  });

  test('finds a custom implementation set with Symbol.for directly', () => {
    function fn() {}
    const custom = () => Promise.resolve();
    fn[Symbol.for('nodejs.util.promisify.custom')] = custom;
    expect(promisify(fn)).toBe(custom);
  });

  test('throws a TypeError if the custom property is not a function', () => {
    function fn() {}
    fn[promisify.custom] = 'nope';
    expect(() => promisify(fn)).toThrow(TypeError);
  });

  test('ignores a custom property that is undefined', async () => {
    function fn(cb) {
      cb(null, 'normal');
    }
    fn[promisify.custom] = undefined;
    await expect(promisify(fn)()).resolves.toBe('normal');
  });

  test('is idempotent: promisifying the result returns the same function', () => {
    const fn = (cb) => cb(null, 1);
    const once = promisify(fn);
    expect(promisify(once)).toBe(once);
  });

  test('throws a TypeError when fn is not a function', () => {
    expect(() => promisify(null)).toThrow(TypeError);
    expect(() => promisify({})).toThrow(TypeError);
  });

  test('preserves `this` and converts sync throws to rejections', async () => {
    const obj = {
      value: 7,
      get: promisify(function (cb) {
        cb(null, this.value);
      }),
      broken: promisify(() => {
        throw new Error('sync');
      }),
    };
    await expect(obj.get()).resolves.toBe(7);
    await expect(obj.broken()).rejects.toThrow('sync');
  });
});
