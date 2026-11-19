import uniqueArray from './index';

describe('uniqueArray', () => {
  test('removes duplicate numbers', () => {
    expect(uniqueArray([1, 2, 1, 3, 2])).toEqual([1, 2, 3]);
  });

  test('keeps first-occurrence order', () => {
    expect(uniqueArray(['b', 'a', 'b', 'c', 'a'])).toEqual(['b', 'a', 'c']);
  });

  test('empty array', () => {
    expect(uniqueArray([])).toEqual([]);
  });

  test('array without duplicates is copied', () => {
    const input = [3, 1, 2];
    const result = uniqueArray(input);
    expect(result).toEqual([3, 1, 2]);
    expect(result).not.toBe(input);
  });

  test('treats NaN as equal to NaN', () => {
    expect(uniqueArray([NaN, 1, NaN])).toEqual([NaN, 1]);
  });

  test('treats 0 and -0 as equal, keeping the first', () => {
    const result = uniqueArray([0, -0]);
    expect(result).toHaveLength(1);
    expect(Object.is(result[0], 0)).toBe(true);
  });

  test('does not coerce types', () => {
    expect(uniqueArray([1, '1', true, 'true', null, 'null'])).toEqual([
      1,
      '1',
      true,
      'true',
      null,
      'null',
    ]);
  });

  test('compares objects by reference', () => {
    const a = { id: 1 };
    const b = { id: 1 };
    const result = uniqueArray([a, a, b]);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(a);
    expect(result[1]).toBe(b);
  });

  test('keeps undefined and null once each', () => {
    expect(uniqueArray([undefined, null, undefined, null])).toEqual([undefined, null]);
  });

  test('does not mutate the input', () => {
    const input = [2, 2, 1];
    uniqueArray(input);
    expect(input).toEqual([2, 2, 1]);
  });
});
