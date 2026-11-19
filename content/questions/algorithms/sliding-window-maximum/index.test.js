import slidingMax from './index';

function naive(samples, k) {
  const out = [];
  for (let i = 0; i + k <= samples.length; i++) out.push(Math.max(...samples.slice(i, i + k)));
  return out;
}

describe('slidingMax', () => {
  test('basic example', () => {
    expect(slidingMax([16, 17, 33, 16, 15, 50, 16, 16], 3)).toEqual([33, 33, 33, 50, 50, 50]);
  });

  test('k = 1 returns every sample', () => {
    expect(slidingMax([4, 2, 12, 3], 1)).toEqual([4, 2, 12, 3]);
  });

  test('k = n returns the global max', () => {
    expect(slidingMax([4, 2, 12, 3], 4)).toEqual([12]);
  });

  test('strictly decreasing input', () => {
    expect(slidingMax([9, 8, 7, 6, 5], 2)).toEqual([9, 8, 7, 6]);
  });

  test('strictly increasing input', () => {
    expect(slidingMax([1, 2, 3, 4, 5], 3)).toEqual([3, 4, 5]);
  });

  test('duplicates and negatives', () => {
    expect(slidingMax([-3, -3, -1, -7, -1, -1], 2)).toEqual([-3, -1, -1, -1, -1]);
  });

  test('random inputs match a naive implementation', () => {
    for (let t = 0; t < 50; t++) {
      const n = 1 + Math.floor(Math.random() * 40);
      const k = 1 + Math.floor(Math.random() * n);
      const samples = Array.from({ length: n }, () => Math.floor(Math.random() * 20) - 10);
      expect(slidingMax(samples, k)).toEqual(naive(samples, k));
    }
  });

  test('large input with a large window (rules out O(n*k))', () => {
    const n = 100000;
    const k = 50000;
    // Decreasing sequence: every window's max is its first element.
    const samples = Array.from({ length: n }, (_, i) => n - i);
    const result = slidingMax(samples, k);
    expect(result).toHaveLength(n - k + 1);
    expect(result[0]).toBe(n);
    expect(result[result.length - 1]).toBe(k);
  });

  test('large random input', () => {
    const n = 100000;
    const k = 40000;
    const samples = Array.from({ length: n }, (_, i) => (i * 7919) % 100003);
    const result = slidingMax(samples, k);
    expect(result).toHaveLength(n - k + 1);
    // Spot-check a few windows directly.
    for (const start of [0, 12345, n - k]) {
      let max = -Infinity;
      for (let i = start; i < start + k; i++) if (samples[i] > max) max = samples[i];
      expect(result[start]).toBe(max);
    }
  });
});
