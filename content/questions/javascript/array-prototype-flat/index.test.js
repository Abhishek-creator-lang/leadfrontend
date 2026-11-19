/* eslint-disable no-sparse-arrays */
import myFlat from './index';

describe('Array.prototype.myFlat', () => {
  const nested = [1, [2, [3, [4]]]];

  test('is attached to Array.prototype', () => {
    expect(Array.prototype.myFlat).toBe(myFlat);
  });

  test('flattens one level by default', () => {
    expect(nested.myFlat()).toEqual([1, 2, [3, [4]]]);
    expect(nested.myFlat(undefined)).toEqual([1, 2, [3, [4]]]);
  });

  test('respects an explicit depth', () => {
    expect(nested.myFlat(2)).toEqual([1, 2, 3, [4]]);
    expect(nested.myFlat(3)).toEqual([1, 2, 3, 4]);
  });

  test('flattens completely with Infinity', () => {
    expect([[[[['deep']]]], 'top'].myFlat(Infinity)).toEqual(['deep', 'top']);
  });

  test('depth 0 or negative returns a shallow copy', () => {
    const arr = [1, [2]];
    const zero = arr.myFlat(0);
    expect(zero).toEqual([1, [2]]);
    expect(zero).not.toBe(arr);
    expect(zero[1]).toBe(arr[1]);
    expect(arr.myFlat(-3)).toEqual([1, [2]]);
  });

  test('coerces depth like the native method', () => {
    expect(nested.myFlat('2')).toEqual([1, 2, 3, [4]]);
    expect(nested.myFlat(1.9)).toEqual([1, 2, [3, [4]]]);
    expect(nested.myFlat(NaN)).toEqual([1, [2, [3, [4]]]]);
    expect(nested.myFlat(null)).toEqual([1, [2, [3, [4]]]]);
  });

  test('removes holes at every flattened level, but keeps undefined', () => {
    expect([1, , [2, , 3], undefined].myFlat()).toEqual([1, 2, 3, undefined]);
    expect([1, , 2].myFlat(0)).toEqual([1, 2]);
  });

  test('does not flatten array-like objects or strings', () => {
    const arrayLike = { length: 1, 0: 'a' };
    const spreadable = { length: 1, 0: 'b', [Symbol.isConcatSpreadable]: true };
    const result = ['xy', arrayLike, spreadable].myFlat(Infinity);
    expect(result).toHaveLength(3);
    expect(result[0]).toBe('xy');
    expect(result[1]).toBe(arrayLike);
    expect(result[2]).toBe(spreadable);
  });

  test('does not mutate the source or nested arrays', () => {
    const inner = [2, [3]];
    const arr = [1, inner];
    arr.myFlat(Infinity);
    expect(arr).toEqual([1, [2, [3]]]);
    expect(inner).toEqual([2, [3]]);
  });

  test('handles empty arrays at any level', () => {
    expect([].myFlat()).toEqual([]);
    expect([[], [[]], 1].myFlat(Infinity)).toEqual([1]);
  });
});
