import fromPairs from './index';

describe('fromPairs', () => {
  test('builds an object from pairs', () => {
    expect(
      fromPairs([
        ['a', 1],
        ['b', 2],
      ])
    ).toEqual({ a: 1, b: 2 });
  });

  test('empty input returns an empty object', () => {
    expect(fromPairs([])).toEqual({});
  });

  test('returns a plain object', () => {
    expect(Object.getPrototypeOf(fromPairs([['a', 1]]))).toBe(Object.prototype);
  });

  test('later pairs win for duplicate keys', () => {
    expect(
      fromPairs([
        ['x', 1],
        ['x', 2],
      ])
    ).toEqual({ x: 2 });
  });

  test('non-string keys are converted to strings', () => {
    const result = fromPairs([
      [1, 'one'],
      [true, 'yes'],
    ]);
    expect(Object.keys(result)).toEqual(['1', 'true']);
    expect(result['1']).toBe('one');
  });

  test('symbol keys stay symbols', () => {
    const sym = Symbol('id');
    expect(fromPairs([[sym, 42]])[sym]).toBe(42);
  });

  test('a pair without a value creates the key with undefined', () => {
    const result = fromPairs([['k']]);
    expect(Object.prototype.hasOwnProperty.call(result, 'k')).toBe(true);
    expect(result.k).toBeUndefined();
  });

  test('keeps falsy values', () => {
    expect(
      fromPairs([
        ['a', 0],
        ['b', ''],
        ['c', false],
        ['d', null],
      ])
    ).toEqual({ a: 0, b: '', c: false, d: null });
  });

  test('keys named like Object.prototype methods become own properties', () => {
    const result = fromPairs([['constructor', 'c']]);
    expect(Object.prototype.hasOwnProperty.call(result, 'constructor')).toBe(true);
    expect(result.constructor).toBe('c');
  });

  test('does not use Object.fromEntries', () => {
    const original = Object.fromEntries;
    Object.fromEntries = () => {
      throw new Error('Object.fromEntries is not allowed');
    };
    let result;
    try {
      result = fromPairs([['a', 1]]);
    } finally {
      Object.fromEntries = original;
    }
    expect(result).toEqual({ a: 1 });
  });
});
