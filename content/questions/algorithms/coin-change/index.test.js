import minPacks from './index';

describe('minPacks', () => {
  test('greedy would be wrong', () => {
    expect(minPacks([1, 5, 12], 15)).toBe(3);
  });

  test('impossible amount', () => {
    expect(minPacks([4, 6], 7)).toBe(-1);
  });

  test('zero amount', () => {
    expect(minPacks([3], 0)).toBe(0);
  });

  test('mixed sizes', () => {
    expect(minPacks([2, 7], 11)).toBe(3);
  });

  test('exact single pack', () => {
    expect(minPacks([1, 5, 12], 12)).toBe(1);
  });

  test('pack sizes larger than the amount are ignored', () => {
    expect(minPacks([100, 3], 9)).toBe(3);
    expect(minPacks([100], 9)).toBe(-1);
  });

  test('unsorted pack sizes', () => {
    expect(minPacks([25, 1, 10, 5], 63)).toBe(6);
  });

  test('large amount (rules out exponential recursion)', () => {
    expect(minPacks([1, 7, 23, 61], 10000)).toBe(170);
    expect(minPacks([6, 10, 15], 9997)).toBe(668);
    expect(minPacks([37, 53], 9999)).toBe(195);
    expect(minPacks([4, 6], 9999)).toBe(-1);
  });
});
