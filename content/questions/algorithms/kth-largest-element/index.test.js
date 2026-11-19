import kthLargest from './index';

describe('kthLargest', () => {
  const loads = [1200, 340, 980, 4100, 760];

  test('k = 1 is the maximum', () => {
    expect(kthLargest(loads, 1)).toBe(4100);
  });

  test('k = 2', () => {
    expect(kthLargest(loads, 2)).toBe(1200);
  });

  test('k = n is the minimum', () => {
    expect(kthLargest(loads, 5)).toBe(340);
  });

  test('duplicates count separately', () => {
    expect(kthLargest([5, 5, 3], 2)).toBe(5);
    expect(kthLargest([5, 5, 3], 3)).toBe(3);
  });

  test('single element and negatives', () => {
    expect(kthLargest([7], 1)).toBe(7);
    expect(kthLargest([3, -1, 2], 3)).toBe(-1);
  });

  test('numeric, not lexicographic, ordering', () => {
    expect(kthLargest([10, 9, 100, 1], 2)).toBe(10);
  });

  test('does not mutate the input', () => {
    const input = [4, 1, 3, 2];
    kthLargest(input, 2);
    expect(input).toEqual([4, 1, 3, 2]);
  });

  test('random arrays match sorting', () => {
    for (let t = 0; t < 100; t++) {
      const n = 1 + Math.floor(Math.random() * 30);
      const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 10));
      const k = 1 + Math.floor(Math.random() * n);
      const expected = arr.slice().sort((a, b) => b - a)[k - 1];
      expect(kthLargest(arr, k)).toBe(expected);
    }
  });

  test('large sorted input and many duplicates', () => {
    const n = 100000;
    const sorted = Array.from({ length: n }, (_, i) => i);
    expect(kthLargest(sorted, 1)).toBe(n - 1);
    expect(kthLargest(sorted, 50000)).toBe(50000);
    const same = new Array(n).fill(42);
    expect(kthLargest(same, 777)).toBe(42);
  });

  test('large random input', () => {
    const n = 100000;
    const arr = Array.from({ length: n }, (_, i) => (i * 7919) % 100003);
    const expected = arr.slice().sort((a, b) => b - a)[499];
    expect(kthLargest(arr, 500)).toBe(expected);
  });
});
