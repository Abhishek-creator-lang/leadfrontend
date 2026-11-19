import heapSort from './index';

const ascending = (arr) => arr.slice().sort((a, b) => a - b);

describe('heapSort', () => {
  test('sorts a small array', () => {
    expect(heapSort([312, 48, 1024, 48, 7, 256])).toEqual([7, 48, 48, 256, 312, 1024]);
  });

  test('sorts in place and returns the same reference', () => {
    const input = [3, 2, 1];
    expect(heapSort(input)).toBe(input);
    expect(input).toEqual([1, 2, 3]);
  });

  test('empty, one and two elements', () => {
    expect(heapSort([])).toEqual([]);
    expect(heapSort([1])).toEqual([1]);
    expect(heapSort([2, 1])).toEqual([1, 2]);
  });

  test('negatives, fractions and numeric order', () => {
    expect(heapSort([10, -3.5, 2, 100, -40, 0])).toEqual([-40, -3.5, 0, 2, 10, 100]);
  });

  test('already sorted and reverse sorted', () => {
    expect(heapSort([1, 2, 3, 4, 5, 6, 7])).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(heapSort([7, 6, 5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  test('random arrays match a reference sort', () => {
    for (let n = 0; n < 60; n++) {
      const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 15) - 5);
      const expected = ascending(arr);
      expect(heapSort(arr)).toEqual(expected);
    }
  });

  test('large sorted input', () => {
    const arr = Array.from({ length: 100000 }, (_, i) => i);
    expect(heapSort(arr.slice())).toEqual(arr);
  });

  test('large input with every value equal', () => {
    expect(heapSort(new Array(100000).fill(3))).toEqual(new Array(100000).fill(3));
  });

  test('large random input', () => {
    const arr = Array.from({ length: 200000 }, () => Math.random() * 1e6);
    const expected = ascending(arr);
    expect(heapSort(arr)).toEqual(expected);
  });
});
