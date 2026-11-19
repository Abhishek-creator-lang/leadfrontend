import deepClone from './index';

describe('deepClone', () => {
  test('returns primitives unchanged', () => {
    expect(deepClone(1)).toBe(1);
    expect(deepClone('s')).toBe('s');
    expect(deepClone(true)).toBe(true);
    expect(deepClone(null)).toBeNull();
    expect(deepClone(undefined)).toBeUndefined();
    expect(deepClone(10n)).toBe(10n);
  });

  test('clones a flat object into a new object', () => {
    const src = { a: 1, b: 'two' };
    const copy = deepClone(src);
    expect(copy).toEqual(src);
    expect(copy).not.toBe(src);
  });

  test('clones nested objects without sharing references', () => {
    const src = { a: { b: { c: 1 } } };
    const copy = deepClone(src);
    expect(copy.a).not.toBe(src.a);
    expect(copy.a.b).not.toBe(src.a.b);
    copy.a.b.c = 99;
    expect(src.a.b.c).toBe(1);
  });

  test('clones arrays as arrays', () => {
    const src = [1, [2, 3], { x: [4] }];
    const copy = deepClone(src);
    expect(Array.isArray(copy)).toBe(true);
    expect(Array.isArray(copy[1])).toBe(true);
    expect(copy).toEqual(src);
    expect(copy[2].x).not.toBe(src[2].x);
  });

  test('mutating the original does not affect the copy', () => {
    const src = { list: [{ v: 1 }] };
    const copy = deepClone(src);
    src.list.push({ v: 2 });
    src.list[0].v = 100;
    expect(copy).toEqual({ list: [{ v: 1 }] });
  });

  test('keeps keys whose value is undefined', () => {
    const copy = deepClone({ a: undefined, b: [undefined] });
    expect(Object.keys(copy)).toEqual(['a', 'b']);
    expect(copy.b).toHaveLength(1);
  });

  test('preserves special numbers that JSON loses', () => {
    const copy = deepClone({ nan: NaN, inf: Infinity, negZero: -0 });
    expect(Number.isNaN(copy.nan)).toBe(true);
    expect(copy.inf).toBe(Infinity);
    expect(Object.is(copy.negZero, -0)).toBe(true);
  });

  test('handles empty containers', () => {
    const src = { o: {}, a: [] };
    const copy = deepClone(src);
    expect(copy).toEqual({ o: {}, a: [] });
    expect(copy.o).not.toBe(src.o);
    expect(copy.a).not.toBe(src.a);
  });

  test('clones the same nested object twice when referenced twice', () => {
    const shared = { n: 1 };
    const copy = deepClone({ x: shared, y: shared });
    expect(copy.x).toEqual({ n: 1 });
    expect(copy.x).not.toBe(shared);
    expect(copy.y).not.toBe(shared);
  });
});
