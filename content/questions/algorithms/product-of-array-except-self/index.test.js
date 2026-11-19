import productExceptSelf from './index';

// Treat -0 and 0 as equal.
const clean = (arr) => arr.map((x) => (x === 0 ? 0 : x));

describe('productExceptSelf', () => {
  test('basic example', () => {
    expect(clean(productExceptSelf([2, 3, 4, 5]))).toEqual([60, 40, 30, 24]);
  });

  test('a single zero', () => {
    expect(clean(productExceptSelf([1, 0, 3, 4]))).toEqual([0, 12, 0, 0]);
  });

  test('two zeros', () => {
    expect(clean(productExceptSelf([0, 2, 0]))).toEqual([0, 0, 0]);
  });

  test('negative numbers', () => {
    expect(clean(productExceptSelf([-1, 2, -3]))).toEqual([-6, 3, -2]);
  });

  test('single element and empty array', () => {
    expect(productExceptSelf([9])).toEqual([1]);
    expect(productExceptSelf([])).toEqual([]);
  });

  test('two elements swap', () => {
    expect(clean(productExceptSelf([7, -2]))).toEqual([-2, 7]);
  });

  test('does not mutate the input', () => {
    const input = [1, 2, 3];
    productExceptSelf(input);
    expect(input).toEqual([1, 2, 3]);
  });

  test('large input (rules out O(n^2))', () => {
    // Mostly 1s and -1s, with a 2, a 3 and a 0 placed inside.
    const n = 100000;
    const factors = Array.from({ length: n }, (_, i) => (i % 2 === 0 ? 1 : -1));
    factors[10] = 2;
    factors[20000] = 3;
    factors[n - 1] = 0;
    const out = clean(productExceptSelf(factors));
    // Only the zero's position is non-zero.
    let sign = 1;
    for (let i = 0; i < n - 1; i++) if (factors[i] < 0) sign = -sign;
    expect(out[n - 1]).toBe(sign * 6);
    expect(out[0]).toBe(0);
    expect(out[50000]).toBe(0);
  });
});
