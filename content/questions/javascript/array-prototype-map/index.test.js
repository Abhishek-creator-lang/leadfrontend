/* eslint-disable no-sparse-arrays */
import myMap from './index';

describe('Array.prototype.myMap', () => {
  test('is attached to Array.prototype', () => {
    expect(Array.prototype.myMap).toBe(myMap);
  });

  test('maps every element', () => {
    expect([1, 2, 3].myMap((n) => n * n)).toEqual([1, 4, 9]);
  });

  test('passes element, index and the original array', () => {
    const arr = ['x', 'y'];
    const cb = jest.fn((v, i) => v + i);
    expect(arr.myMap(cb)).toEqual(['x0', 'y1']);
    expect(cb.mock.calls[1][0]).toBe('y');
    expect(cb.mock.calls[1][1]).toBe(1);
    expect(cb.mock.calls[1][2]).toBe(arr);
  });

  test('uses thisArg as `this` in the callback', () => {
    const ctx = { prefix: '#' };
    const result = [1, 2].myMap(function (n) {
      return this.prefix + n;
    }, ctx);
    expect(result).toEqual(['#1', '#2']);
  });

  test('returns a new array and leaves the source untouched', () => {
    const arr = [1, 2];
    const result = arr.myMap((n) => n + 1);
    expect(result).not.toBe(arr);
    expect(arr).toEqual([1, 2]);
  });

  test('keeps holes and does not call the callback for them', () => {
    const cb = jest.fn((n) => n * 2);
    const result = [1, , 3].myMap(cb);
    expect(cb).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(3);
    expect(1 in result).toBe(false);
    expect(result[0]).toBe(2);
    expect(result[2]).toBe(6);
  });

  test('does not call the callback for an array created with Array(n)', () => {
    const cb = jest.fn(() => 1);
    const result = Array(3).myMap(cb);
    expect(cb).not.toHaveBeenCalled();
    expect(result).toHaveLength(3);
    expect(0 in result).toBe(false);
  });

  test('visits explicit undefined values', () => {
    const cb = jest.fn(() => 'v');
    expect([undefined, undefined].myMap(cb)).toEqual(['v', 'v']);
    expect(cb).toHaveBeenCalledTimes(2);
  });

  test('ignores elements appended during iteration', () => {
    const arr = [1, 2];
    const result = arr.myMap((n) => {
      arr.push(n);
      return n;
    });
    expect(result).toEqual([1, 2]);
  });

  test('throws a TypeError for a non-function callback', () => {
    expect(() => [1, 2].myMap(null)).toThrow(TypeError);
    expect(() => [].myMap({})).toThrow(TypeError);
  });

  test('works on array-like objects', () => {
    const arrayLike = { length: 2, 0: 'a', 1: 'b' };
    expect(Array.prototype.myMap.call(arrayLike, (s) => s.toUpperCase())).toEqual(['A', 'B']);
  });
});
