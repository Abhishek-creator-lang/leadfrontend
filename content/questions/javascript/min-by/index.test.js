import minBy from './index';

const flights = [
  { id: 'A1', minutes: 95 },
  { id: 'B2', minutes: 70 },
  { id: 'C3', minutes: 120 },
];

describe('minBy', () => {
  test('returns the element with the smallest value', () => {
    expect(minBy(flights, (f) => f.minutes)).toBe(flights[1]);
  });

  test('accepts a property name', () => {
    expect(minBy(flights, 'minutes')).toBe(flights[1]);
  });

  test('empty array returns undefined', () => {
    expect(minBy([], (x) => x)).toBeUndefined();
  });

  test('compares dates by time', () => {
    const late = { at: new Date('2024-05-01') };
    const early = { at: new Date('2023-01-01') };
    expect(minBy([late, early], (e) => e.at)).toBe(early);
  });

  test('skips null, undefined and NaN values', () => {
    expect(minBy([null, 5, undefined, NaN, 3], (x) => x)).toBe(3);
    expect(minBy([NaN, 4, 2], (x) => x)).toBe(2);
  });

  test('returns undefined when every value is skipped', () => {
    expect(minBy([{}, {}], 'missing')).toBeUndefined();
  });

  test('first element wins ties', () => {
    const a = { v: 1 };
    const b = { v: 1 };
    expect(minBy([a, b], 'v')).toBe(a);
  });

  test('Infinity can be the answer', () => {
    expect(minBy([Infinity], (x) => x)).toBe(Infinity);
  });

  test('can return a falsy element', () => {
    expect(minBy([3, 0, 1], (x) => x)).toBe(0);
  });

  test('calls the iteratee once per element', () => {
    const fn = jest.fn((x) => x);
    minBy([3, 1, 2], fn);
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
