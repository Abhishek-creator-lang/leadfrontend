import maxBy from './index';

describe('maxBy', () => {
  test('returns the element with the largest value', () => {
    const products = [
      { name: 'pen', price: 3 },
      { name: 'lamp', price: 40 },
      { name: 'mug', price: 12 },
    ];
    expect(maxBy(products, (p) => p.price)).toBe(products[1]);
  });

  test('works with strings', () => {
    expect(maxBy(['apple', 'fig', 'banana'], (s) => s.length)).toBe('banana');
  });

  test('empty array returns undefined', () => {
    expect(maxBy([], (x) => x)).toBeUndefined();
  });

  test('skips null, undefined and NaN values', () => {
    const a = { n: 1 };
    const c = { n: 3 };
    expect(maxBy([a, { n: null }, c, { n: undefined }], (o) => o.n)).toBe(c);
    expect(maxBy([NaN, 2, 1], (x) => x)).toBe(2);
  });

  test('returns undefined when every value is skipped', () => {
    expect(maxBy([{}, {}], (o) => o.missing)).toBeUndefined();
  });

  test('handles all-negative values', () => {
    expect(maxBy([-5, -2, -9], (x) => x)).toBe(-2);
  });

  test('-Infinity can be the answer', () => {
    expect(maxBy([-Infinity], (x) => x)).toBe(-Infinity);
  });

  test('first element wins ties', () => {
    const a = { id: 'a', v: 5 };
    const b = { id: 'b', v: 5 };
    expect(maxBy([a, b], (o) => o.v)).toBe(a);
  });

  test('calls the iteratee once per element', () => {
    const fn = jest.fn((x) => x);
    maxBy([3, 1, 2], fn);
    expect(fn).toHaveBeenCalledTimes(3);
    expect(fn.mock.calls).toEqual([[3], [1], [2]]);
  });

  test('can return a falsy element', () => {
    expect(maxBy([0, -1], (x) => x)).toBe(0);
  });
});
