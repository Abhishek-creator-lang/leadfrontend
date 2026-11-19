/* eslint-disable no-sparse-arrays */
import square from './index';

describe('Array.prototype.square', () => {
  test('is attached to Array.prototype', () => {
    expect(Array.prototype.square).toBe(square);
  });

  test('squares every element', () => {
    expect([1, 2, 3].square()).toEqual([1, 4, 9]);
  });

  test('handles negatives, zero and fractions', () => {
    expect([-3, 0, 0.5].square()).toEqual([9, 0, 0.25]);
  });

  test('returns an empty array for an empty input', () => {
    expect([].square()).toEqual([]);
  });

  test('returns a new array and does not mutate the original', () => {
    const arr = [2, 4];
    const result = arr.square();
    expect(result).not.toBe(arr);
    expect(arr).toEqual([2, 4]);
  });

  test('uses `*` coercion', () => {
    const result = ['3', null, 'x'].square();
    expect(result[0]).toBe(9);
    expect(result[1]).toBe(0);
    expect(Number.isNaN(result[2])).toBe(true);
  });

  test('keeps holes', () => {
    const result = [1, , 3].square();
    expect(result).toHaveLength(3);
    expect(1 in result).toBe(false);
    expect(result[2]).toBe(9);
  });

  test('can be chained', () => {
    expect([1, 2, 3].square().square()).toEqual([1, 16, 81]);
  });
});
