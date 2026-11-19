/* eslint-disable no-sparse-arrays */
import myReduce from './index';

describe('Array.prototype.myReduce', () => {
  test('is attached to Array.prototype', () => {
    expect(Array.prototype.myReduce).toBe(myReduce);
  });

  test('sums with an initial value', () => {
    expect([1, 2, 3, 4].myReduce((acc, n) => acc + n, 0)).toBe(10);
  });

  test('without an initial value, starts from the first element at index 1', () => {
    const cb = jest.fn((acc, n) => acc + n);
    expect([1, 2, 3].myReduce(cb)).toBe(6);
    expect(cb).toHaveBeenCalledTimes(2);
    expect(cb.mock.calls[0][0]).toBe(1);
    expect(cb.mock.calls[0][1]).toBe(2);
    expect(cb.mock.calls[0][2]).toBe(1);
  });

  test('passes accumulator, value, index and the array', () => {
    const arr = ['a'];
    const cb = jest.fn(() => 'done');
    arr.myReduce(cb, 'start');
    expect(cb).toHaveBeenCalledWith('start', 'a', 0, arr);
  });

  test('builds non-numeric accumulators', () => {
    const result = ['a', 'b', 'a'].myReduce((counts, ch) => {
      counts[ch] = (counts[ch] || 0) + 1;
      return counts;
    }, {});
    expect(result).toEqual({ a: 2, b: 1 });
  });

  test('returns the initial value for an empty array without calling the callback', () => {
    const cb = jest.fn();
    expect([].myReduce(cb, 42)).toBe(42);
    expect(cb).not.toHaveBeenCalled();
  });

  test('returns the only element when there is no initial value', () => {
    const cb = jest.fn();
    expect(['solo'].myReduce(cb)).toBe('solo');
    expect(cb).not.toHaveBeenCalled();
  });

  test('throws a TypeError for an empty array with no initial value', () => {
    expect(() => [].myReduce((a, b) => a + b)).toThrow(TypeError);
  });

  test('treats an explicit undefined as a provided initial value', () => {
    const result = [1].myReduce((acc, n) => [acc, n], undefined);
    expect(result).toEqual([undefined, 1]);
  });

  test('skips holes, including leading holes when no initial value is given', () => {
    const cb = jest.fn((acc, n) => acc + n);
    expect([, , 5, , 6].myReduce(cb)).toBe(11);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb.mock.calls[0][2]).toBe(4);
  });

  test('throws a TypeError for an all-holes array with no initial value', () => {
    expect(() => [, , ].myReduce((a, b) => a + b)).toThrow(TypeError);
  });

  test('ignores elements appended during iteration', () => {
    const arr = [1, 2, 3];
    const result = arr.myReduce((acc, n) => {
      arr.push(100);
      return acc + n;
    }, 0);
    expect(result).toBe(6);
  });

  test('throws a TypeError for a non-function callback', () => {
    expect(() => [1, 2].myReduce('sum', 0)).toThrow(TypeError);
  });
});
