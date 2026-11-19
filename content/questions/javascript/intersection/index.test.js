import intersection from './index';

describe('intersection', () => {
  test('returns values present in all arrays', () => {
    expect(intersection([1, 2, 3], [2, 3, 4], [3, 2, 9])).toEqual([2, 3]);
  });

  test('orders the result by the first array', () => {
    expect(intersection([3, 1, 2], [1, 2, 3])).toEqual([3, 1, 2]);
  });

  test('removes duplicates from the result', () => {
    expect(intersection(['a', 'b', 'a'], ['a', 'a'])).toEqual(['a']);
  });

  test('duplicates in one array do not count as presence in another', () => {
    expect(intersection([1, 1], [2, 2], [1])).toEqual([]);
  });

  test('returns empty array when nothing is shared', () => {
    expect(intersection([1, 2], [3, 4])).toEqual([]);
  });

  test('any empty array gives an empty result', () => {
    expect(intersection([1, 2], [])).toEqual([]);
    expect(intersection([], [1, 2])).toEqual([]);
  });

  test('a single array is de-duplicated', () => {
    expect(intersection([1, 2, 2, 1])).toEqual([1, 2]);
  });

  test('no arguments returns an empty array', () => {
    expect(intersection()).toEqual([]);
  });

  test('uses SameValueZero (NaN and -0)', () => {
    expect(intersection([NaN, 1], [NaN])).toEqual([NaN]);
    expect(intersection([0], [-0])).toHaveLength(1);
  });

  test('objects intersect by reference only', () => {
    const shared = { id: 1 };
    expect(intersection([shared, { id: 2 }], [{ id: 2 }, shared])).toEqual([shared]);
  });

  test('does not mutate inputs', () => {
    const a = [1, 2, 3];
    const b = [3, 2];
    intersection(a, b);
    expect(a).toEqual([1, 2, 3]);
    expect(b).toEqual([3, 2]);
  });
});
