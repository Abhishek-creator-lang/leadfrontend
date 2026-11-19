import clamp from './index';

describe('clamp', () => {
  test('returns the number when inside the range', () => {
    expect(clamp(3, 0, 5)).toBe(3);
  });

  test('raises numbers below the range to lower', () => {
    expect(clamp(-10, 0, 5)).toBe(0);
  });

  test('lowers numbers above the range to upper', () => {
    expect(clamp(10, 0, 5)).toBe(5);
  });

  test('bounds are inclusive', () => {
    expect(clamp(0, 0, 5)).toBe(0);
    expect(clamp(5, 0, 5)).toBe(5);
  });

  test('works with negative ranges and decimals', () => {
    expect(clamp(-0.5, -1, 1)).toBe(-0.5);
    expect(clamp(-3.2, -2.5, -1)).toBe(-2.5);
  });

  test('works when lower equals upper', () => {
    expect(clamp(100, 7, 7)).toBe(7);
    expect(clamp(-100, 7, 7)).toBe(7);
  });

  test('NaN input returns NaN', () => {
    expect(clamp(NaN, 0, 5)).toBeNaN();
  });

  test('handles infinities', () => {
    expect(clamp(Infinity, 0, 5)).toBe(5);
    expect(clamp(-Infinity, 0, 5)).toBe(0);
    expect(clamp(7, 0, Infinity)).toBe(7);
  });
});
