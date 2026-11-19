import range from './index';

describe('range', () => {
  test('one argument counts up from 0', () => {
    expect(range(4)).toEqual([0, 1, 2, 3]);
  });

  test('one negative argument counts down from 0', () => {
    expect(range(-4)).toEqual([0, -1, -2, -3]);
  });

  test('start and end', () => {
    expect(range(1, 5)).toEqual([1, 2, 3, 4]);
  });

  test('custom step', () => {
    expect(range(0, 20, 5)).toEqual([0, 5, 10, 15]);
    expect(range(0, 10, 3)).toEqual([0, 3, 6, 9]);
  });

  test('negative step', () => {
    expect(range(0, -4, -1)).toEqual([0, -1, -2, -3]);
  });

  test('step defaults to -1 when end < start', () => {
    expect(range(5, 1)).toEqual([5, 4, 3, 2]);
  });

  test('fractional step', () => {
    expect(range(0, 1, 0.25)).toEqual([0, 0.25, 0.5, 0.75]);
  });

  test('computes values by index, not by accumulation', () => {
    const values = range(0, 1, 0.1);
    expect(values).toHaveLength(10);
    expect(values[9]).toBe(9 * 0.1);
  });

  test('step pointing away from end returns []', () => {
    expect(range(0, 5, -1)).toEqual([]);
    expect(range(5, 0, 1)).toEqual([]);
  });

  test('zero step repeats start', () => {
    expect(range(1, 4, 0)).toEqual([1, 1, 1]);
  });

  test('empty ranges', () => {
    expect(range(0)).toEqual([]);
    expect(range(3, 3)).toEqual([]);
  });
});
