import subsets from './index';

// Order-insensitive: sort inside each subset, then sort the list of subsets.
const normalize = (lists) => lists.map((l) => JSON.stringify(l.slice().sort())).sort();

describe('subsets', () => {
  test('three flags', () => {
    expect(normalize(subsets(['darkMode', 'beta', 'newNav']))).toEqual(
      normalize([
        [],
        ['darkMode'],
        ['beta'],
        ['newNav'],
        ['darkMode', 'beta'],
        ['darkMode', 'newNav'],
        ['beta', 'newNav'],
        ['darkMode', 'beta', 'newNav'],
      ])
    );
  });

  test('empty input', () => {
    expect(subsets([])).toEqual([[]]);
  });

  test('single item', () => {
    expect(normalize(subsets([5]))).toEqual(normalize([[], [5]]));
  });

  test('order within subsets does not matter', () => {
    const result = normalize(subsets([2, 1]));
    expect(result).toEqual(normalize([[], [1], [2], [1, 2]]));
  });

  test('subsets are independent arrays', () => {
    const result = subsets([1, 2]);
    const full = result.find((s) => s.length === 2);
    full.push(3);
    expect(result.filter((s) => s.length === 1).every((s) => s.length === 1)).toBe(true);
    expect(result.find((s) => s.length === 0)).toEqual([]);
  });

  test('does not mutate the input', () => {
    const input = ['a', 'b'];
    subsets(input);
    expect(input).toEqual(['a', 'b']);
  });

  test('sixteen items: 65,536 unique subsets', () => {
    const items = Array.from({ length: 16 }, (_, i) => i);
    const result = subsets(items);
    expect(result).toHaveLength(65536);
    expect(new Set(normalize(result)).size).toBe(65536);
    const sizes = new Array(17).fill(0);
    result.forEach((s) => sizes[s.length]++);
    expect(sizes[8]).toBe(12870); // C(16, 8)
  });
});
