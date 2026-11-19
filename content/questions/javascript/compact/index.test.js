import compact from './index';

describe('compact', () => {
  test('removes basic falsy values', () => {
    expect(compact([0, 1, false, 2, '', 3, null])).toEqual([1, 2, 3]);
  });

  test('removes undefined and NaN', () => {
    expect(compact(['a', undefined, NaN, 'b'])).toEqual(['a', 'b']);
  });

  test('removes -0 and 0n', () => {
    expect(compact([-0, 0n, 1n, 5])).toEqual([1n, 5]);
  });

  test('keeps truthy values that look falsy', () => {
    const arr = [];
    const obj = {};
    const result = compact([arr, obj, '0', 'false', ' ']);
    expect(result).toEqual([[], {}, '0', 'false', ' ']);
    expect(result[0]).toBe(arr);
    expect(result[1]).toBe(obj);
  });

  test('empty array returns an empty array', () => {
    expect(compact([])).toEqual([]);
  });

  test('all falsy returns an empty array', () => {
    expect(compact([null, undefined, false, 0, ''])).toEqual([]);
  });

  test('returns a new array and does not mutate the input', () => {
    const input = [1, 0, 2];
    const result = compact(input);
    expect(result).not.toBe(input);
    expect(input).toEqual([1, 0, 2]);
  });

  test('preserves order', () => {
    expect(compact(['c', 0, 'a', null, 'b'])).toEqual(['c', 'a', 'b']);
  });
});
