import quickSort from './index';

const ascending = (arr) => arr.slice().sort((a, b) => a - b);

describe('quickSort', () => {
  test('sorts a small array', () => {
    expect(quickSort([120, 35, 35, 410, 8, 97])).toEqual([8, 35, 35, 97, 120, 410]);
  });

  test('sorts in place and returns the same reference', () => {
    const input = [3, 1, 2];
    const output = quickSort(input);
    expect(output).toBe(input);
    expect(input).toEqual([1, 2, 3]);
  });

  test('empty and single-element arrays', () => {
    expect(quickSort([])).toEqual([]);
    expect(quickSort([1])).toEqual([1]);
  });

  test('two elements', () => {
    expect(quickSort([2, 1])).toEqual([1, 2]);
    expect(quickSort([1, 1])).toEqual([1, 1]);
  });

  test('negatives, fractions and numeric order', () => {
    expect(quickSort([10, -2.5, 9, 100, 0, -30])).toEqual([-30, -2.5, 0, 9, 10, 100]);
  });

  test('random arrays match a reference sort', () => {
    for (let n = 0; n < 60; n++) {
      const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 10));
      const expected = ascending(arr);
      expect(quickSort(arr)).toEqual(expected);
    }
  });

  test('large already-sorted input does not degrade', () => {
    const arr = Array.from({ length: 100000 }, (_, i) => i);
    const expected = arr.slice();
    expect(quickSort(arr)).toEqual(expected);
  });

  test('large reverse-sorted input', () => {
    const arr = Array.from({ length: 100000 }, (_, i) => 100000 - i);
    expect(quickSort(arr.slice())).toEqual(ascending(arr));
  });

  test('large input where every value is equal', () => {
    const arr = new Array(100000).fill(7);
    expect(quickSort(arr)).toEqual(new Array(100000).fill(7));
  });

  test('large random input', () => {
    const arr = Array.from({ length: 200000 }, () => Math.random());
    const expected = ascending(arr);
    expect(quickSort(arr)).toEqual(expected);
  });
});
