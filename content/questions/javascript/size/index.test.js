import size from './index';

describe('size', () => {
  test('arrays use length', () => {
    expect(size([1, 2, 3])).toBe(3);
    expect(size([])).toBe(0);
  });

  test('sparse arrays include holes', () => {
    // eslint-disable-next-line no-sparse-arrays
    expect(size([, ,])).toBe(2);
  });

  test('plain objects count own enumerable keys', () => {
    expect(size({ a: 1, b: 2 })).toBe(2);
    expect(size({})).toBe(0);
    expect(size(Object.create({ inherited: 1 }))).toBe(0);
  });

  test('objects with a length property are still objects', () => {
    expect(size({ length: 5 })).toBe(1);
  });

  test('strings count code points', () => {
    expect(size('pebbles')).toBe(7);
    expect(size('')).toBe(0);
    expect(size('😀ok')).toBe(3);
  });

  test('Map and Set use size', () => {
    expect(size(new Map([['a', 1]]))).toBe(1);
    expect(size(new Set([1, 2, 2]))).toBe(2);
  });

  test('typed arrays and arguments use length', () => {
    expect(size(new Int16Array(4))).toBe(4);
    const args = (function () {
      return arguments;
    })('a', 'b');
    expect(size(args)).toBe(2);
  });

  test('null and undefined have size 0', () => {
    expect(size(null)).toBe(0);
    expect(size(undefined)).toBe(0);
  });

  test('other primitives have size 0', () => {
    expect(size(42)).toBe(0);
    expect(size(true)).toBe(0);
    expect(size(Symbol('s'))).toBe(0);
    expect(size(5n)).toBe(0);
  });

  test('functions count own enumerable keys, not arity', () => {
    function fn(a, b, c) {}
    expect(size(fn)).toBe(0);
    fn.extra = true;
    expect(size(fn)).toBe(1);
  });

  test('null-prototype objects work', () => {
    const bare = Object.create(null);
    bare.x = 1;
    expect(size(bare)).toBe(1);
  });
});
