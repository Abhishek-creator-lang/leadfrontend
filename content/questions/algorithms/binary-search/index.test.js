import binarySearch from './index';

describe('binarySearch', () => {
  const offsets = [0, 48, 96, 160, 208, 300];

  test('finds a value in the middle', () => {
    expect(binarySearch(offsets, 160)).toBe(3);
    expect(binarySearch(offsets, 96)).toBe(2);
  });

  test('finds the first and last values', () => {
    expect(binarySearch(offsets, 0)).toBe(0);
    expect(binarySearch(offsets, 300)).toBe(5);
  });

  test('returns -1 for a missing value between elements', () => {
    expect(binarySearch(offsets, 170)).toBe(-1);
  });

  test('returns -1 for values outside the range', () => {
    expect(binarySearch(offsets, -5)).toBe(-1);
    expect(binarySearch(offsets, 301)).toBe(-1);
  });

  test('empty array', () => {
    expect(binarySearch([], 1)).toBe(-1);
  });

  test('single element', () => {
    expect(binarySearch([7], 7)).toBe(0);
    expect(binarySearch([7], 8)).toBe(-1);
  });

  test('two elements', () => {
    expect(binarySearch([3, 9], 3)).toBe(0);
    expect(binarySearch([3, 9], 9)).toBe(1);
    expect(binarySearch([3, 9], 5)).toBe(-1);
  });

  test('negative numbers', () => {
    expect(binarySearch([-40, -12, -3, 0, 15], -12)).toBe(1);
  });

  test('every element of a large array is found quickly', () => {
    const big = Array.from({ length: 200000 }, (_, i) => i * 3 - 1000);
    for (let i = 0; i < big.length; i += 7) {
      expect(binarySearch(big, big[i])).toBe(i);
    }
    expect(binarySearch(big, 1)).toBe(-1);
  });
});
