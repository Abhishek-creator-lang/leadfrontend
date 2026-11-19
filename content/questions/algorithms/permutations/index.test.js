import permutations from './index';

// Order-insensitive comparison of a list of arrays.
const normalize = (lists) => lists.map((l) => JSON.stringify(l)).sort();

describe('permutations', () => {
  test('three items', () => {
    expect(normalize(permutations(['chart', 'table', 'map']))).toEqual(
      normalize([
        ['chart', 'table', 'map'],
        ['chart', 'map', 'table'],
        ['table', 'chart', 'map'],
        ['table', 'map', 'chart'],
        ['map', 'chart', 'table'],
        ['map', 'table', 'chart'],
      ])
    );
  });

  test('one item', () => {
    expect(permutations([1])).toEqual([[1]]);
  });

  test('empty input has one empty ordering', () => {
    expect(permutations([])).toEqual([[]]);
  });

  test('two items', () => {
    expect(normalize(permutations([1, 2]))).toEqual(normalize([[1, 2], [2, 1]]));
  });

  test('each permutation is a separate array', () => {
    const result = permutations([1, 2, 3]);
    expect(result[0]).not.toBe(result[1]);
    result[0].push(99);
    expect(result[1]).toHaveLength(3);
  });

  test('does not mutate the input', () => {
    const input = [3, 1, 2];
    permutations(input);
    expect(input).toEqual([3, 1, 2]);
  });

  test('eight items: 40,320 unique permutations of the right length', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const result = permutations(items);
    expect(result).toHaveLength(40320);
    const keys = new Set(result.map((p) => p.join('')));
    expect(keys.size).toBe(40320);
    for (const p of result) {
      expect(p.slice().sort()).toEqual(items);
    }
  });
});
