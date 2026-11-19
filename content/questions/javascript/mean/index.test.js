import mean from './index';

describe('mean', () => {
  test('averages integers', () => {
    expect(mean([4, 2, 8, 6])).toBe(5);
  });

  test('returns fractional results', () => {
    expect(mean([1, 2])).toBe(1.5);
  });

  test('handles negative numbers', () => {
    expect(mean([-3, 3])).toBe(0);
    expect(mean([-2, -4])).toBe(-3);
  });

  test('single element returns that element', () => {
    expect(mean([7])).toBe(7);
  });

  test('empty array returns NaN', () => {
    expect(mean([])).toBeNaN();
  });

  test('NaN element propagates', () => {
    expect(mean([1, NaN, 3])).toBeNaN();
  });

  test('floating point values', () => {
    expect(mean([0.1, 0.2, 0.3])).toBeCloseTo(0.2);
  });

  test('does not mutate the input', () => {
    const input = [3, 1, 2];
    mean(input);
    expect(input).toEqual([3, 1, 2]);
  });
});
