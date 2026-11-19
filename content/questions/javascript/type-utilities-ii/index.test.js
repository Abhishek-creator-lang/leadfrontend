import isPlainObject, { isArray, isFunction, isObject } from './index';

const primitives = [null, undefined, 0, 1, NaN, '', 'str', true, false, Symbol('s'), 10n];

describe('isArray', () => {
  test('true for arrays', () => {
    expect(isArray([])).toBe(true);
    expect(isArray([1, 2])).toBe(true);
    expect(isArray(new Array(3))).toBe(true);
  });

  test('false for array-likes and typed arrays', () => {
    const args = (function () {
      return arguments;
    })();
    expect(isArray(args)).toBe(false);
    expect(isArray({ length: 0 })).toBe(false);
    expect(isArray(new Uint8Array(2))).toBe(false);
    expect(isArray(Object.create(Array.prototype))).toBe(false);
  });

  test('false for primitives', () => {
    primitives.forEach((p) => expect(isArray(p)).toBe(false));
  });
});

describe('isFunction', () => {
  test('true for every kind of function', () => {
    expect(isFunction(function () {})).toBe(true);
    expect(isFunction(() => {})).toBe(true);
    expect(isFunction(async () => {})).toBe(true);
    expect(isFunction(function* () {})).toBe(true);
    expect(isFunction(class A {})).toBe(true);
    expect(isFunction(Math.max.bind(null))).toBe(true);
  });

  test('false for non-functions', () => {
    expect(isFunction({})).toBe(false);
    expect(isFunction([])).toBe(false);
    primitives.forEach((p) => expect(isFunction(p)).toBe(false));
  });
});

describe('isObject', () => {
  test('true for objects, arrays and functions', () => {
    expect(isObject({})).toBe(true);
    expect(isObject([])).toBe(true);
    expect(isObject(() => {})).toBe(true);
    expect(isObject(new Date())).toBe(true);
    expect(isObject(new Map())).toBe(true);
    expect(isObject(new Number(1))).toBe(true);
  });

  test('false for null and other primitives', () => {
    primitives.forEach((p) => expect(isObject(p)).toBe(false));
  });
});

describe('isPlainObject', () => {
  test('true for literals, new Object and null-prototype objects', () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject({ a: 1 })).toBe(true);
    expect(isPlainObject(new Object())).toBe(true);
    expect(isPlainObject(Object.create(null))).toBe(true);
  });

  test('false for arrays, functions and built-in objects', () => {
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject(() => {})).toBe(false);
    expect(isPlainObject(new Date())).toBe(false);
    expect(isPlainObject(new Map())).toBe(false);
    expect(isPlainObject(/re/)).toBe(false);
  });

  test('false for class instances and objects with another prototype', () => {
    class Point {}
    expect(isPlainObject(new Point())).toBe(false);
    expect(isPlainObject(Object.create({}))).toBe(false);
  });

  test('works for objects that override constructor', () => {
    expect(isPlainObject({ constructor: 'nope' })).toBe(true);
  });

  test('false for primitives', () => {
    primitives.forEach((p) => expect(isPlainObject(p)).toBe(false));
  });
});
