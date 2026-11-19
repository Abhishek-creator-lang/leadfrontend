import difference from './index';

describe('difference', () => {
  test('removes values present in the other array', () => {
    expect(difference([1, 2, 3, 4], [2, 4])).toEqual([1, 3]);
  });

  test('supports several exclusion arrays', () => {
    expect(difference([1, 2, 3, 4, 5], [1], [5, 6])).toEqual([2, 3, 4]);
  });

  test('with no exclusions returns a copy', () => {
    const input = ['a', 'b'];
    const result = difference(input);
    expect(result).toEqual(['a', 'b']);
    expect(result).not.toBe(input);
  });

  test('empty exclusion array removes nothing', () => {
    expect(difference(['a', 'b'], [])).toEqual(['a', 'b']);
  });

  test('empty input returns empty array', () => {
    expect(difference([], [1, 2])).toEqual([]);
  });

  test('uses SameValueZero (NaN matches NaN, 0 matches -0)', () => {
    expect(difference([NaN, 1], [NaN])).toEqual([1]);
    expect(difference([-0, 1], [0])).toEqual([1]);
  });

  test('keeps duplicates that are not excluded', () => {
    expect(difference([1, 1, 2, 3, 3], [2])).toEqual([1, 1, 3, 3]);
  });

  test('objects compare by reference', () => {
    const a = { id: 1 };
    const b = { id: 1 };
    expect(difference([a, b], [a])).toEqual([b]);
    expect(difference([a, b], [a])[0]).toBe(b);
  });

  test('does not mutate arguments', () => {
    const input = [1, 2, 3];
    const values = [2];
    difference(input, values);
    expect(input).toEqual([1, 2, 3]);
    expect(values).toEqual([2]);
  });
});
