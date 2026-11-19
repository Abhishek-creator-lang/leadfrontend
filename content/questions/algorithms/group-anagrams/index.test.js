import groupAnagrams from './index';

// Order-insensitive comparison: sort words in each group, then sort the groups.
function normalize(groups) {
  return groups.map((g) => g.slice().sort()).sort((a, b) => (a.join('|') < b.join('|') ? -1 : 1));
}

describe('groupAnagrams', () => {
  test('basic example', () => {
    const result = groupAnagrams(['listen', 'stone', 'silent', 'notes', 'enlist', 'apple', 'onset']);
    expect(normalize(result)).toEqual(
      normalize([['listen', 'silent', 'enlist'], ['stone', 'notes', 'onset'], ['apple']])
    );
  });

  test('empty input', () => {
    expect(groupAnagrams([])).toEqual([]);
  });

  test('duplicates stay together', () => {
    expect(normalize(groupAnagrams(['ab', 'ab', 'ba']))).toEqual([['ab', 'ab', 'ba']]);
  });

  test('empty strings group together', () => {
    expect(normalize(groupAnagrams(['', 'a', '']))).toEqual(normalize([['', ''], ['a']]));
  });

  test('same letters, different counts are not anagrams', () => {
    expect(normalize(groupAnagrams(['aab', 'abb', 'bba']))).toEqual(normalize([['aab'], ['abb', 'bba']]));
  });

  test('every word unique', () => {
    expect(normalize(groupAnagrams(['cat', 'dog', 'bird']))).toEqual(normalize([['cat'], ['dog'], ['bird']]));
  });

  test('every input word appears exactly once', () => {
    const words = ['race', 'care', 'acre', 'x', 'scare', 'races'];
    const flat = groupAnagrams(words).flat().sort();
    expect(flat).toEqual(words.slice().sort());
  });

  test('large input of long, mostly unique words', () => {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const words = [];
    for (let i = 0; i < 10000; i++) {
      let w = '';
      for (let j = 0; j < 100; j++) w += letters[(i * 7 + j * j + (i >> 3) * j) % 26];
      words.push(w);
    }
    // Add a reversed copy of the first 500 words: each forms a pair with its original.
    for (let i = 0; i < 500; i++) words.push(words[i].split('').reverse().join(''));
    const groups = groupAnagrams(words);
    expect(groups.flat()).toHaveLength(10500);
    expect(groups.find((g) => g.includes(words[0])).length).toBeGreaterThanOrEqual(2);

    // Cross-check the number of groups with a simple sorted-letters count.
    const distinctKeys = new Set(words.map((w) => w.split('').sort().join('')));
    expect(groups).toHaveLength(distinctKeys.size);
    for (const g of groups) {
      const key = g[0].split('').sort().join('');
      for (const w of g) expect(w.split('').sort().join('')).toBe(key);
    }
  });
});
