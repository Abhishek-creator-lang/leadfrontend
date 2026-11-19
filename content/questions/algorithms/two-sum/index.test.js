import twoSum from './index';

describe('twoSum', () => {
  test('basic example', () => {
    expect(twoSum([1299, 450, 2500, 850], 2149)).toEqual([0, 3]);
  });

  test('two items with the same price', () => {
    expect(twoSum([500, 500, 120], 1000)).toEqual([0, 1]);
  });

  test('does not use the same item twice', () => {
    expect(twoSum([500, 300, 700], 1000)).toEqual([1, 2]);
  });

  test('negative numbers and zero', () => {
    expect(twoSum([-200, 700, 300], 100)).toEqual([0, 2]);
    expect(twoSum([4, 0, 9, 0], 0)).toEqual([1, 3]);
  });

  test('two-element array', () => {
    expect(twoSum([3, 4], 7)).toEqual([0, 1]);
  });

  test('pair at the very end', () => {
    expect(twoSum([1, 2, 3, 4, 50, 60], 110)).toEqual([4, 5]);
  });

  test('large input (rules out O(n^2))', () => {
    const n = 100000;
    const prices = Array.from({ length: n }, (_, i) => 2 * i); // all even
    prices[n - 2] = 1000001;
    prices[n - 1] = 1000003;
    // Only the two odd prices can reach this target.
    expect(twoSum(prices, 2000004)).toEqual([n - 2, n - 1]);
  });
});
