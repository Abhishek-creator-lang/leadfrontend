import inRange from './index';

describe('inRange', () => {
  test('number inside the range', () => {
    expect(inRange(3, 2, 4)).toBe(true);
  });

  test('start is inclusive', () => {
    expect(inRange(2, 2, 4)).toBe(true);
  });

  test('end is exclusive', () => {
    expect(inRange(4, 2, 4)).toBe(false);
  });

  test('number outside the range', () => {
    expect(inRange(1, 2, 4)).toBe(false);
    expect(inRange(10, 2, 4)).toBe(false);
  });

  test('two arguments mean [0, end)', () => {
    expect(inRange(4, 8)).toBe(true);
    expect(inRange(0, 8)).toBe(true);
    expect(inRange(8, 8)).toBe(false);
    expect(inRange(-1, 8)).toBe(false);
  });

  test('swaps start and end when start > end', () => {
    expect(inRange(-3, -2, -6)).toBe(true);
    expect(inRange(3, 5, 2)).toBe(true);
    expect(inRange(5, 5, 2)).toBe(false);
  });

  test('two-argument form with a negative end', () => {
    expect(inRange(-2, -5)).toBe(true);
    expect(inRange(0, -5)).toBe(false);
  });

  test('empty range is always false', () => {
    expect(inRange(3, 3, 3)).toBe(false);
  });

  test('works with decimals', () => {
    expect(inRange(1.5, 1, 2)).toBe(true);
    expect(inRange(2.0000001, 1, 2)).toBe(false);
  });

  test('NaN is never in range', () => {
    expect(inRange(NaN, 0, 5)).toBe(false);
  });
});
