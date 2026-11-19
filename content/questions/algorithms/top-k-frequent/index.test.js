import topKFrequent from './index';

// Results may be in any order, so compare as sorted string lists.
const sorted = (arr) => arr.map((v) => `${typeof v}:${v}`).sort();

describe('topKFrequent', () => {
  test('emoji reactions', () => {
    const result = topKFrequent(['👍', '🎉', '👍', '❤️', '🎉', '👍', '😂'], 2);
    expect(sorted(result)).toEqual(sorted(['👍', '🎉']));
  });

  test('k = 1', () => {
    expect(topKFrequent([4, 4, 1, 1, 1, 9], 1)).toEqual([1]);
  });

  test('single item', () => {
    expect(topKFrequent([7], 1)).toEqual([7]);
  });

  test('k equal to the number of distinct values', () => {
    expect(sorted(topKFrequent(['a', 'b', 'b', 'c', 'c', 'c'], 3))).toEqual(sorted(['a', 'b', 'c']));
  });

  test('numbers and numeric strings are different values', () => {
    const result = topKFrequent([1, '1', '1', 1, '1', 2], 1);
    expect(result).toEqual(['1']);
  });

  test('returns exactly k values', () => {
    const result = topKFrequent([5, 5, 5, 6, 6, 7, 8, 8, 8, 8], 2);
    expect(result).toHaveLength(2);
    expect(sorted(result)).toEqual(sorted([5, 8]));
  });

  test('large input', () => {
    // Value v (0..999) appears v + 1 times, shuffled deterministically. Top 5 are 995..999.
    const items = [];
    for (let v = 0; v < 1000; v++) for (let i = 0; i <= v; i++) items.push(v);
    for (let i = items.length - 1; i > 0; i--) {
      const j = (i * 7919) % (i + 1);
      [items[i], items[j]] = [items[j], items[i]];
    }
    expect(sorted(topKFrequent(items, 5))).toEqual(sorted([995, 996, 997, 998, 999]));
  });
});
