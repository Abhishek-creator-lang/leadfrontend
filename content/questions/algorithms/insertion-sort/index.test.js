import insertionSort from './index';

const ascending = (arr) => arr.slice().sort((a, b) => a - b);

describe('insertionSort', () => {
  test('sorts a small array', () => {
    expect(insertionSort([88, 92, 75, 92, 60])).toEqual([60, 75, 88, 92, 92]);
  });

  test('sorts in place and returns the same reference', () => {
    const input = [2, 3, 1];
    expect(insertionSort(input)).toBe(input);
    expect(input).toEqual([1, 2, 3]);
  });

  test('empty and single-element arrays', () => {
    expect(insertionSort([])).toEqual([]);
    expect(insertionSort([4])).toEqual([4]);
  });

  test('reverse sorted input', () => {
    expect(insertionSort([5, 4, 3, 2, 1, 0])).toEqual([0, 1, 2, 3, 4, 5]);
  });

  test('negatives, fractions and numeric order', () => {
    expect(insertionSort([10, -1, 2.5, 100, -50])).toEqual([-50, -1, 2.5, 10, 100]);
  });

  test('nearly sorted input with one element out of place', () => {
    expect(insertionSort([1, 2, 3, 9, 4, 5, 6])).toEqual([1, 2, 3, 4, 5, 6, 9]);
  });

  test('random arrays match a reference sort', () => {
    for (let n = 0; n < 50; n++) {
      const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 20) - 10);
      const expected = ascending(arr);
      expect(insertionSort(arr)).toEqual(expected);
    }
  });

  test('sorts a few thousand random numbers', () => {
    const arr = Array.from({ length: 4000 }, () => Math.random() * 1000);
    const expected = ascending(arr);
    expect(insertionSort(arr)).toEqual(expected);
  });
});
