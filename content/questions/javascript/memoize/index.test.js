import memoize from './index';

describe('memoize', () => {
  test('returns the same result as func', () => {
    const square = memoize((n) => n * n);
    expect(square(4)).toBe(16);
    expect(square(5)).toBe(25);
  });

  test('calls func only once per key', () => {
    const fn = jest.fn((n) => n * 2);
    const m = memoize(fn);
    m(3);
    m(3);
    m(3);
    expect(fn).toHaveBeenCalledTimes(1);
    m(4);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('uses only the first argument as the default key', () => {
    const fn = jest.fn((a, b) => a + b);
    const m = memoize(fn);
    expect(m(1, 2)).toBe(3);
    expect(m(1, 100)).toBe(3);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('distinguishes 1 from "1"', () => {
    const fn = jest.fn((x) => typeof x);
    const m = memoize(fn);
    expect(m(1)).toBe('number');
    expect(m('1')).toBe('string');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('compares object keys by reference', () => {
    const fn = jest.fn((o) => o.v);
    const m = memoize(fn);
    const a = { v: 1 };
    m(a);
    m(a);
    m({ v: 1 });
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('NaN is a usable key', () => {
    const fn = jest.fn(() => 'nan');
    const m = memoize(fn);
    m(NaN);
    m(NaN);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('caches undefined results', () => {
    const fn = jest.fn(() => undefined);
    const m = memoize(fn);
    m('k');
    m('k');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('resolver decides the key and receives all arguments', () => {
    const fn = jest.fn((a, b) => a + b);
    const resolver = jest.fn((a, b) => `${a}|${b}`);
    const m = memoize(fn, resolver);
    expect(m(1, 2)).toBe(3);
    expect(m(1, 3)).toBe(4);
    expect(m(1, 2)).toBe(3);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(resolver).toHaveBeenCalledWith(1, 3);
  });

  test('forwards `this` to func', () => {
    const obj = {
      base: 100,
      add: memoize(function (n) {
        return this.base + n;
      }),
    };
    expect(obj.add(1)).toBe(101);
  });

  test('exposes the cache as a Map that can be cleared', () => {
    const fn = jest.fn((n) => n);
    const m = memoize(fn);
    m(1);
    expect(m.cache).toBeInstanceOf(Map);
    expect(m.cache.get(1)).toBe(1);
    m.cache.clear();
    m(1);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('does not cache when func throws', () => {
    let calls = 0;
    const m = memoize(() => {
      calls++;
      if (calls === 1) throw new Error('fail');
      return 'ok';
    });
    expect(() => m('x')).toThrow('fail');
    expect(m('x')).toBe('ok');
  });
});
