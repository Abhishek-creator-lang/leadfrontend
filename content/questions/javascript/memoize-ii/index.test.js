import memoize from './index';

describe('memoize (multiple arguments)', () => {
  test('caches by every argument', () => {
    const fn = jest.fn((a, b) => a * b);
    const m = memoize(fn);
    expect(m(2, 3)).toBe(6);
    expect(m(2, 3)).toBe(6);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(m(2, 4)).toBe(8);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('argument order matters', () => {
    const fn = jest.fn((a, b) => a - b);
    const m = memoize(fn);
    expect(m(5, 2)).toBe(3);
    expect(m(2, 5)).toBe(-3);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('distinguishes 1 from "1"', () => {
    const fn = jest.fn((a, b) => `${typeof a}${typeof b}`);
    const m = memoize(fn);
    expect(m(1, 2)).toBe('numbernumber');
    expect(m('1', 2)).toBe('stringnumber');
  });

  test('no collisions from string joining', () => {
    const fn = jest.fn((...args) => args.length);
    const m = memoize(fn);
    expect(m('a,b')).toBe(1);
    expect(m('a', 'b')).toBe(2);
  });

  test('the number of arguments is part of the key', () => {
    const fn = jest.fn((...args) => args.length);
    const m = memoize(fn);
    expect(m()).toBe(0);
    expect(m(1)).toBe(1);
    expect(m(1, undefined)).toBe(2);
    expect(m(1)).toBe(1);
    expect(m()).toBe(0);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('objects match by reference', () => {
    const fn = jest.fn(() => ({}));
    const m = memoize(fn);
    const opts = { dark: true };
    const first = m('a', opts);
    expect(m('a', opts)).toBe(first);
    expect(m('a', { dark: true })).not.toBe(first);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('NaN arguments hit the cache', () => {
    const fn = jest.fn(() => 'x');
    const m = memoize(fn);
    m(NaN, NaN);
    m(NaN, NaN);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('caches undefined results', () => {
    const fn = jest.fn(() => undefined);
    const m = memoize(fn);
    m(1, 2);
    m(1, 2);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('does not cache when func throws', () => {
    let calls = 0;
    const m = memoize(() => {
      calls++;
      if (calls === 1) throw new Error('nope');
      return calls;
    });
    expect(() => m(1, 2)).toThrow('nope');
    expect(m(1, 2)).toBe(2);
    expect(m(1, 2)).toBe(2);
  });

  test('forwards `this`', () => {
    const obj = {
      scale: 10,
      mul: memoize(function (a, b) {
        return a * b * this.scale;
      }),
    };
    expect(obj.mul(2, 3)).toBe(60);
  });

  test('clear() empties the cache', () => {
    const fn = jest.fn((a, b) => a + b);
    const m = memoize(fn);
    m(1, 2);
    m.clear();
    m(1, 2);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
