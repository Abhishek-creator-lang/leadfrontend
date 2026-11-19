import lisLength from './index';

describe('lisLength', () => {
  test('basic example', () => {
    expect(lisLength([3, 1, 4, 1, 5, 9, 2, 6])).toBe(4);
  });

  test('strictly decreasing', () => {
    expect(lisLength([5, 4, 3, 2])).toBe(1);
  });

  test('equal values do not extend', () => {
    expect(lisLength([2, 2, 2])).toBe(1);
    expect(lisLength([1, 2, 2, 3])).toBe(3);
  });

  test('empty and single', () => {
    expect(lisLength([])).toBe(0);
    expect(lisLength([42])).toBe(1);
  });

  test('scattered values', () => {
    expect(lisLength([0, 8, 4, 12, 2, 10, 6, 14, 1, 9])).toBe(4);
  });

  test('negative numbers', () => {
    expect(lisLength([-5, -10, -3, -4, 0, -1, 2])).toBe(4);
  });

  test('already increasing', () => {
    expect(lisLength([1, 2, 3, 4, 5, 6, 7])).toBe(7);
  });

  test('large input needs O(n log n)', () => {
    // Blocks of 100 decreasing values, each block higher than the last: LIS = number of blocks.
    const values = [];
    const blocks = 1000;
    for (let b = 0; b < blocks; b++) {
      for (let k = 99; k >= 0; k--) values.push(b * 100 + k);
    }
    expect(lisLength(values)).toBe(blocks);
  });

  test('large increasing input with noise', () => {
    const n = 100000;
    // Even indices hold 0, 2, 4, ...; odd indices hold -1, which can only replace the leading 0.
    const values = Array.from({ length: n }, (_, i) => (i % 2 === 0 ? i : -1));
    expect(lisLength(values)).toBe(n / 2);
  });
});
