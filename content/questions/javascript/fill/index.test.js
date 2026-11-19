import fill from './index';

describe('fill', () => {
  test('fills the whole array by default', () => {
    expect(fill([1, 2, 3], 'a')).toEqual(['a', 'a', 'a']);
  });

  test('fills a range [start, end)', () => {
    expect(fill([4, 6, 8, 10], '*', 1, 3)).toEqual([4, '*', '*', 10]);
  });

  test('supports a negative start', () => {
    expect(fill([4, 6, 8, 10], '*', -2)).toEqual([4, 6, '*', '*']);
  });

  test('supports a negative end', () => {
    expect(fill([4, 6, 8, 10], '*', 1, -1)).toEqual([4, '*', '*', 10]);
  });

  test('clamps indices that are out of range', () => {
    expect(fill([1, 2, 3], 0, -100, 100)).toEqual([0, 0, 0]);
  });

  test('start past the end changes nothing', () => {
    expect(fill([1, 2, 3], 0, 5)).toEqual([1, 2, 3]);
  });

  test('start >= end changes nothing', () => {
    expect(fill([1, 2, 3], 0, 2, 1)).toEqual([1, 2, 3]);
    expect(fill([1, 2, 3], 0, 1, 1)).toEqual([1, 2, 3]);
  });

  test('never grows the array', () => {
    const result = fill([1, 2], 'x', 0, 10);
    expect(result).toEqual(['x', 'x']);
    expect(result).toHaveLength(2);
  });

  test('mutates and returns the same array', () => {
    const input = [1, 2, 3];
    const result = fill(input, 9, 1);
    expect(result).toBe(input);
    expect(input).toEqual([1, 9, 9]);
  });

  test('does not use Array.prototype.fill', () => {
    const original = Array.prototype.fill;
    Array.prototype.fill = function () {
      throw new Error('Array.prototype.fill is not allowed');
    };
    let result;
    try {
      result = fill([1, 2], 0);
    } finally {
      Array.prototype.fill = original;
    }
    expect(result).toEqual([0, 0]);
  });

  test('empty array is returned unchanged', () => {
    expect(fill([], 1)).toEqual([]);
  });
});
