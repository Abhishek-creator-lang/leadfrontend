import chunk from './index';

describe('chunk', () => {
  test('splits evenly', () => {
    expect(chunk(['a', 'b', 'c', 'd'], 2)).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });

  test('puts the remainder in a shorter last chunk', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  test('size larger than the array gives one chunk', () => {
    expect(chunk([1, 2, 3], 5)).toEqual([[1, 2, 3]]);
  });

  test('size defaults to 1', () => {
    expect(chunk([1, 2, 3])).toEqual([[1], [2], [3]]);
  });

  test('empty array returns an empty array', () => {
    expect(chunk([], 3)).toEqual([]);
  });

  test('size below 1 returns an empty array', () => {
    expect(chunk([1, 2, 3], 0)).toEqual([]);
    expect(chunk([1, 2, 3], -2)).toEqual([]);
    expect(chunk([1, 2, 3], 0.5)).toEqual([]);
  });

  test('non-integer size is rounded down', () => {
    expect(chunk([1, 2, 3, 4, 5], 2.9)).toEqual([[1, 2], [3, 4], [5]]);
  });

  test('does not mutate the input', () => {
    const input = [1, 2, 3, 4];
    chunk(input, 3);
    expect(input).toEqual([1, 2, 3, 4]);
  });

  test('copies elements by reference', () => {
    const obj = { id: 1 };
    const [[first]] = chunk([obj], 1);
    expect(first).toBe(obj);
  });
});
