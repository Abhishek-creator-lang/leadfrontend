import promisify from './index';

function readConfig(name, callback) {
  setTimeout(() => {
    if (name === 'missing') callback(new Error('Not found'));
    else callback(null, { name });
  }, 5);
}

describe('promisify', () => {
  test('returns a function that returns a promise', () => {
    const fn = promisify(readConfig);
    expect(typeof fn).toBe('function');
    const p = fn('app');
    expect(p).toBeInstanceOf(Promise);
    return p;
  });

  test('fulfills with the callback value', async () => {
    await expect(promisify(readConfig)('app')).resolves.toEqual({ name: 'app' });
  });

  test('rejects with the callback error', async () => {
    await expect(promisify(readConfig)('missing')).rejects.toThrow('Not found');
  });

  test('forwards every argument and appends the callback last', async () => {
    const fn = jest.fn((a, b, c, cb) => cb(null, a + b + c));
    await expect(promisify(fn)(1, 2, 3)).resolves.toBe(6);
    expect(fn.mock.calls[0]).toHaveLength(4);
    expect(typeof fn.mock.calls[0][3]).toBe('function');
  });

  test('treats null and undefined errors as success', async () => {
    await expect(promisify((cb) => cb(null, 'a'))()).resolves.toBe('a');
    await expect(promisify((cb) => cb(undefined, 'b'))()).resolves.toBe('b');
    await expect(promisify((cb) => cb(null))()).resolves.toBeUndefined();
  });

  test('preserves `this`', async () => {
    const db = {
      prefix: 'db:',
      get: promisify(function (key, cb) {
        cb(null, this.prefix + key);
      }),
    };
    await expect(db.get('users')).resolves.toBe('db:users');
  });

  test('turns a synchronous throw into a rejection', async () => {
    const throwing = promisify(() => {
      throw new Error('sync');
    });
    let result;
    expect(() => {
      result = throwing();
    }).not.toThrow();
    await expect(result).rejects.toThrow('sync');
  });

  test('only the first callback call counts', async () => {
    const twice = promisify((cb) => {
      cb(null, 'first');
      cb(new Error('second'));
    });
    await expect(twice()).resolves.toBe('first');
  });

  test('each call is independent', async () => {
    const echo = promisify((x, cb) => setTimeout(() => cb(null, x), 10 - x));
    await expect(Promise.all([echo(1), echo(2), echo(3)])).resolves.toEqual([1, 2, 3]);
  });
});
