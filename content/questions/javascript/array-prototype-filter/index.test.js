/* eslint-disable no-sparse-arrays */
import myFilter from './index';

describe('Array.prototype.myFilter', () => {
  test('is attached to Array.prototype', () => {
    expect(Array.prototype.myFilter).toBe(myFilter);
  });

  test('keeps the elements that pass the predicate', () => {
    expect([1, 2, 3, 4, 5].myFilter((n) => n % 2 === 1)).toEqual([1, 3, 5]);
  });

  test('uses truthiness of the callback result', () => {
    expect([0, 1, '', 'a', null, NaN, {}].myFilter((x) => x)).toEqual([1, 'a', {}]);
    expect([1, 2].myFilter(() => 'yes')).toEqual([1, 2]);
  });

  test('passes element, index and the original array', () => {
    const arr = ['a', 'b'];
    const cb = jest.fn(() => true);
    arr.myFilter(cb);
    expect(cb).toHaveBeenCalledTimes(2);
    expect(cb.mock.calls[0]).toEqual(['a', 0, arr]);
    expect(cb.mock.calls[1][2]).toBe(arr);
  });

  test('uses thisArg as `this` in the callback', () => {
    const ctx = { min: 2 };
    const result = [1, 2, 3].myFilter(function (n) {
      return n >= this.min;
    }, ctx);
    expect(result).toEqual([2, 3]);
  });

  test('returns a new array and does not mutate the original', () => {
    const arr = [1, 2, 3];
    const result = arr.myFilter(() => true);
    expect(result).toEqual(arr);
    expect(result).not.toBe(arr);
    expect(arr).toEqual([1, 2, 3]);
  });

  test('skips holes but visits explicit undefined', () => {
    const cb = jest.fn(() => true);
    const result = [1, , undefined, 4].myFilter(cb);
    expect(cb).toHaveBeenCalledTimes(3);
    expect(result).toEqual([1, undefined, 4]);
    expect(result).toHaveLength(3);
  });

  test('ignores elements appended during iteration', () => {
    const arr = [1, 2, 3];
    const result = arr.myFilter((n) => {
      arr.push(n * 10);
      return true;
    });
    expect(result).toEqual([1, 2, 3]);
  });

  test('skips elements deleted before they are visited', () => {
    const arr = [1, 2, 3];
    const result = arr.myFilter((n, i) => {
      if (i === 0) delete arr[2];
      return true;
    });
    expect(result).toEqual([1, 2]);
  });

  test('throws a TypeError for a non-function callback, even on an empty array', () => {
    expect(() => [1].myFilter('nope')).toThrow(TypeError);
    expect(() => [].myFilter()).toThrow(TypeError);
  });

  test('returns an empty array for an empty input without calling the callback', () => {
    const cb = jest.fn();
    expect([].myFilter(cb)).toEqual([]);
    expect(cb).not.toHaveBeenCalled();
  });

  test('works on array-like objects', () => {
    const arrayLike = { length: 3, 0: 5, 1: 10, 2: 15 };
    expect(Array.prototype.myFilter.call(arrayLike, (n) => n > 5)).toEqual([10, 15]);
  });
});
