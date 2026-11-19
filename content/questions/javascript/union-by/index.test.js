import unionBy from './index';

describe('unionBy', () => {
  test('uses a function iteratee', () => {
    expect(unionBy([2.1], [1.2, 2.3], Math.floor)).toEqual([2.1, 1.2]);
  });

  test('uses a property-name iteratee', () => {
    expect(unionBy([{ x: 1 }], [{ x: 2 }, { x: 1 }], 'x')).toEqual([{ x: 1 }, { x: 2 }]);
  });

  test('keeps the first element per key and returns originals', () => {
    const cachedAda = { id: 1, name: 'Ada (cached)' };
    const bo = { id: 2, name: 'Bo' };
    const freshAda = { id: 1, name: 'Ada' };
    const cy = { id: 3, name: 'Cy' };
    const result = unionBy([cachedAda, bo], [freshAda, cy], (u) => u.id);
    expect(result).toHaveLength(3);
    expect(result[0]).toBe(cachedAda);
    expect(result[1]).toBe(bo);
    expect(result[2]).toBe(cy);
  });

  test('removes duplicates within a single array', () => {
    expect(unionBy([1, 2, 1, 3], (x) => x)).toEqual([1, 2, 3]);
  });

  test('supports more than two arrays', () => {
    expect(unionBy(['a'], ['bb', 'c'], ['dd', 'eee'], (s) => s.length)).toEqual(['a', 'bb', 'eee']);
  });

  test('does not stringify keys', () => {
    expect(unionBy([1], ['1'], (x) => x)).toEqual([1, '1']);
  });

  test('treats NaN keys as equal', () => {
    expect(unionBy([NaN], [NaN, 1], (x) => x)).toEqual([NaN, 1]);
  });

  test('only an iteratee returns []', () => {
    expect(unionBy((x) => x)).toEqual([]);
  });

  test('empty arrays are fine', () => {
    expect(unionBy([], [1], [], (x) => x)).toEqual([1]);
  });

  test('calls the iteratee once per element with the element only', () => {
    const fn = jest.fn((x) => x);
    unionBy([1, 2], [2], fn);
    expect(fn.mock.calls).toEqual([[1], [2], [2]]);
  });

  test('does not mutate inputs', () => {
    const a = [1, 1];
    const b = [2];
    unionBy(a, b, (x) => x);
    expect(a).toEqual([1, 1]);
    expect(b).toEqual([2]);
  });
});
