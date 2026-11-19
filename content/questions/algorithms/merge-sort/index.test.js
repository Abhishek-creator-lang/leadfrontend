import mergeSort from './index';

const ascending = (arr) => arr.slice().sort((a, b) => a - b);

describe('mergeSort', () => {
  test('sorts a small array', () => {
    expect(mergeSort([42, 7, 19, 7, -3, 100])).toEqual([-3, 7, 7, 19, 42, 100]);
  });

  test('does not mutate the input', () => {
    const input = [3, 1, 2];
    const output = mergeSort(input);
    expect(input).toEqual([3, 1, 2]);
    expect(output).not.toBe(input);
  });

  test('empty and single-element arrays', () => {
    expect(mergeSort([])).toEqual([]);
    expect(mergeSort([5])).toEqual([5]);
  });

  test('already sorted and reverse sorted', () => {
    expect(mergeSort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
    expect(mergeSort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
  });

  test('duplicates only', () => {
    expect(mergeSort([2, 2, 2, 2])).toEqual([2, 2, 2, 2]);
  });

  test('negative and fractional numbers', () => {
    expect(mergeSort([0.5, -1.25, 3, -10, 0])).toEqual([-10, -1.25, 0, 0.5, 3]);
  });

  test('sorts numerically, not lexicographically', () => {
    expect(mergeSort([10, 9, 100, 1])).toEqual([1, 9, 10, 100]);
  });

  test('random arrays match a reference sort', () => {
    for (let n = 0; n < 60; n++) {
      const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 50) - 25);
      expect(mergeSort(arr)).toEqual(ascending(arr));
    }
  });

  test('sorts 200,000 numbers in O(n log n)', () => {
    const arr = Array.from({ length: 200000 }, () => Math.random() * 1e6);
    expect(mergeSort(arr)).toEqual(ascending(arr));
  });
});
