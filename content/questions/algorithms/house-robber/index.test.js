import maxRevenue from './index';

describe('maxRevenue', () => {
  test('basic example', () => {
    expect(maxRevenue([4, 1, 2, 9, 1])).toBe(13);
  });

  test('skipping two in a row can be optimal', () => {
    expect(maxRevenue([5, 1, 1, 5])).toBe(10);
  });

  test('taking every other slot', () => {
    expect(maxRevenue([2, 7, 9, 3, 1])).toBe(12);
  });

  test('biggest-first greedy would be wrong', () => {
    expect(maxRevenue([8, 9, 8])).toBe(16);
  });

  test('empty, one and two slots', () => {
    expect(maxRevenue([])).toBe(0);
    expect(maxRevenue([6])).toBe(6);
    expect(maxRevenue([3, 10])).toBe(10);
  });

  test('zeros', () => {
    expect(maxRevenue([0, 0, 0])).toBe(0);
    expect(maxRevenue([0, 5, 0, 5])).toBe(10);
  });

  test('large input (rules out exponential search)', () => {
    // Pattern 1, 3, 1, 3 ...: take every 3 -> 50,000 * 3.
    const revenue = Array.from({ length: 100000 }, (_, i) => (i % 2 === 0 ? 1 : 3));
    expect(maxRevenue(revenue)).toBe(150000);
  });

  test('medium input that defeats naive recursion', () => {
    const revenue = Array.from({ length: 60 }, (_, i) => (i * 37) % 11);
    // Cross-check against an explicit table.
    const best = [];
    for (let i = 0; i < revenue.length; i++) {
      best[i] = Math.max(i > 0 ? best[i - 1] : 0, revenue[i] + (i > 1 ? best[i - 2] : 0));
    }
    expect(maxRevenue(revenue)).toBe(best[revenue.length - 1]);
  });
});
