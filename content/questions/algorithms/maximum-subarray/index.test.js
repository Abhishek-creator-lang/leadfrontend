import maxSubarraySum from './index';

describe('maxSubarraySum', () => {
  test('basic example', () => {
    expect(maxSubarraySum([3, -5, 4, -1, 2, 1, -6, 2])).toBe(6);
  });

  test('all negative returns the largest element', () => {
    expect(maxSubarraySum([-8, -3, -6])).toBe(-3);
  });

  test('single element', () => {
    expect(maxSubarraySum([5])).toBe(5);
    expect(maxSubarraySum([-5])).toBe(-5);
  });

  test('whole array is best', () => {
    expect(maxSubarraySum([2, 3, -1, 4])).toBe(8);
  });

  test('best run at the very end', () => {
    expect(maxSubarraySum([-1, -2, 10, 20])).toBe(30);
  });

  test('zeros', () => {
    expect(maxSubarraySum([0, 0, 0])).toBe(0);
    expect(maxSubarraySum([-1, 0, -2])).toBe(0);
  });

  test('a big negative splits two good runs', () => {
    expect(maxSubarraySum([5, 5, -100, 4, 4, 4])).toBe(12);
  });

  test('large input (rules out O(n^2))', () => {
    const n = 100000;
    const changes = Array.from({ length: n }, (_, i) => (i % 3 === 0 ? -2 : 1));
    // Pattern -2, 1, 1 repeats, so every full period sums to 0. A run of 100 fives is planted
    // at 40000..40099: index 39999 is a -2 (extending left never helps) and 40100 is a 1 followed
    // by a -2 at 40101, so the best run is the fives plus that single 1.
    for (let i = 40000; i < 40100; i++) changes[i] = 5;
    expect(maxSubarraySum(changes)).toBe(501);
  });
});
