import deepEqual from './index';

describe('deepEqual', () => {
  test('compares primitives', () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual('a', 'a')).toBe(true);
    expect(deepEqual(1, '1')).toBe(false);
    expect(deepEqual(true, 1)).toBe(false);
    expect(deepEqual(5n, 5n)).toBe(true);
  });

  test('null and undefined', () => {
    expect(deepEqual(null, null)).toBe(true);
    expect(deepEqual(undefined, undefined)).toBe(true);
    expect(deepEqual(null, undefined)).toBe(false);
    expect(deepEqual(null, {})).toBe(false);
    expect(deepEqual({}, null)).toBe(false);
  });

  test('NaN equals NaN, and 0 equals -0', () => {
    expect(deepEqual(NaN, NaN)).toBe(true);
    expect(deepEqual({ v: NaN }, { v: NaN })).toBe(true);
    expect(deepEqual(0, -0)).toBe(true);
    expect(deepEqual(NaN, 0)).toBe(false);
  });

  test('compares flat objects regardless of key order', () => {
    expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
  });

  test('extra or missing keys are not equal', () => {
    expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(deepEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);
  });

  test('undefined value is not the same as a missing key', () => {
    expect(deepEqual({ a: undefined }, {})).toBe(false);
    expect(deepEqual({ a: undefined }, { b: undefined })).toBe(false);
    expect(deepEqual({ a: undefined }, { a: undefined })).toBe(true);
  });

  test('compares arrays by order and length', () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deepEqual([1, 2], [2, 1])).toBe(false);
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
    expect(deepEqual([], [])).toBe(true);
  });

  test('arrays are not equal to array-like objects', () => {
    expect(deepEqual([1], { 0: 1 })).toBe(false);
    expect(deepEqual({ 0: 1, length: 1 }, [1])).toBe(false);
    expect(deepEqual([], {})).toBe(false);
  });

  test('compares deeply nested structures', () => {
    const a = { user: { name: 'Ada', roles: ['admin', { scope: ['read', 'write'] }] } };
    const b = { user: { name: 'Ada', roles: ['admin', { scope: ['read', 'write'] }] } };
    const c = { user: { name: 'Ada', roles: ['admin', { scope: ['read'] }] } };
    expect(deepEqual(a, b)).toBe(true);
    expect(deepEqual(a, c)).toBe(false);
  });

  test('same reference is equal', () => {
    const obj = { a: [1] };
    expect(deepEqual(obj, obj)).toBe(true);
  });

  test('objects are not equal to primitives', () => {
    expect(deepEqual({}, 0)).toBe(false);
    expect(deepEqual('[]', [])).toBe(false);
  });
});
