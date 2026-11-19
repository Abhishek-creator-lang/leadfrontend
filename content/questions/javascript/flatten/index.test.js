import flatten from './index';

describe('flatten', () => {
  test('returns a flat array unchanged in content', () => {
    expect(flatten([1, 2, 3])).toEqual([1, 2, 3]);
  });

  test('flattens completely by default', () => {
    expect(flatten([1, [2, [3, [4, [5]]]], 6])).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test('respects depth 1', () => {
    expect(flatten([1, [2, [3, [4]]]], 1)).toEqual([1, 2, [3, [4]]]);
  });

  test('respects depth 2', () => {
    expect(flatten([1, [2, [3, [4]]]], 2)).toEqual([1, 2, 3, [4]]);
  });

  test('depth 0 returns a shallow copy', () => {
    const input = [1, [2]];
    const out = flatten(input, 0);
    expect(out).toEqual([1, [2]]);
    expect(out).not.toBe(input);
    expect(out[1]).toBe(input[1]);
  });

  test('handles empty arrays at any level', () => {
    expect(flatten([])).toEqual([]);
    expect(flatten([[], [[]], [[[]]], 1])).toEqual([1]);
  });

  test('preserves order across mixed nesting', () => {
    expect(flatten([[1, 2], 3, [[4], 5], [[[6]]]])).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test('does not flatten strings or array-like objects', () => {
    const arrayLike = { length: 1, 0: 'x' };
    expect(flatten(['ab', [arrayLike]])).toEqual(['ab', arrayLike]);
  });

  test('keeps null and undefined but skips holes', () => {
    // eslint-disable-next-line no-sparse-arrays
    expect(flatten([1, , [undefined, null, [, 2]]])).toEqual([1, undefined, null, 2]);
  });

  test('does not mutate the input', () => {
    const input = [1, [2, [3]]];
    flatten(input);
    expect(input).toEqual([1, [2, [3]]]);
  });

  test('handles very deep nesting without a stack overflow', () => {
    let deep = [42];
    for (let i = 0; i < 20000; i++) deep = [deep];
    expect(flatten(deep)).toEqual([42]);
  });

  test('keeps objects by reference', () => {
    const obj = { a: 1 };
    expect(flatten([[obj]])[0]).toBe(obj);
  });
});
