import maxProfit from './index';

describe('maxProfit', () => {
  test('basic example', () => {
    expect(maxProfit([31, 27, 35, 29, 42, 38])).toBe(15);
  });

  test('falling prices give 0', () => {
    expect(maxProfit([50, 40, 30, 20])).toBe(0);
  });

  test('empty and single day', () => {
    expect(maxProfit([])).toBe(0);
    expect(maxProfit([10])).toBe(0);
  });

  test('lowest price after the highest price', () => {
    // max - min would be 100 - 1, but you cannot sell before buying.
    expect(maxProfit([20, 100, 60, 1, 8])).toBe(80);
  });

  test('flat prices', () => {
    expect(maxProfit([5, 5, 5, 5])).toBe(0);
  });

  test('two days', () => {
    expect(maxProfit([3, 9])).toBe(6);
    expect(maxProfit([9, 3])).toBe(0);
  });

  test('fractional prices', () => {
    expect(maxProfit([1.5, 0.25, 2.75])).toBeCloseTo(2.5);
  });

  test('large input (rules out O(n^2))', () => {
    const n = 100000;
    // Zig-zag declining trend, with the only big rise at the very end.
    const prices = Array.from({ length: n }, (_, i) => 1e6 - i * 5 + (i % 2) * 3);
    prices[n - 1] = 2e6;
    const minBefore = Math.min(...prices.slice(0, n - 1));
    expect(maxProfit(prices)).toBe(2e6 - minBefore);
  });
});
