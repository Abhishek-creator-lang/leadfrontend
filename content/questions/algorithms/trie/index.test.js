import Trie from './index';

function build(words) {
  const t = new Trie();
  words.forEach((w) => t.insert(w));
  return t;
}

describe('Trie', () => {
  test('insert and has', () => {
    const t = new Trie();
    expect(t.insert('open file')).toBe(true);
    expect(t.insert('open file')).toBe(false);
    expect(t.has('open file')).toBe(true);
    expect(t.has('open')).toBe(false);
    expect(t.has('open files')).toBe(false);
    expect(t.size()).toBe(1);
  });

  test('hasPrefix', () => {
    const t = build(['open file', 'close']);
    expect(t.hasPrefix('open f')).toBe(true);
    expect(t.hasPrefix('open file')).toBe(true);
    expect(t.hasPrefix('opens')).toBe(false);
    expect(t.hasPrefix('')).toBe(true);
    expect(new Trie().hasPrefix('')).toBe(false);
  });

  test('complete returns sorted matches', () => {
    const t = build(['open recent', 'open folder', 'open file', 'close', 'open']);
    expect(t.complete('open f')).toEqual(['open file', 'open folder']);
    expect(t.complete('open')).toEqual(['open', 'open file', 'open folder', 'open recent']);
    expect(t.complete('x')).toEqual([]);
  });

  test('empty prefix completes to every word', () => {
    const t = build(['b', 'a', 'ab']);
    expect(t.complete('')).toEqual(['a', 'ab', 'b']);
  });

  test('is case-sensitive and handles punctuation', () => {
    const t = build(['Git: Commit', 'git: push', 'Git: Pull']);
    expect(t.complete('Git:')).toEqual(['Git: Commit', 'Git: Pull']);
    expect(t.has('git: Push')).toBe(false);
  });

  test('remove keeps words that share a prefix', () => {
    const t = build(['open', 'open file', 'open folder']);
    expect(t.remove('open')).toBe(true);
    expect(t.has('open')).toBe(false);
    expect(t.complete('open')).toEqual(['open file', 'open folder']);
    expect(t.remove('open file')).toBe(true);
    expect(t.complete('open')).toEqual(['open folder']);
    expect(t.size()).toBe(1);
  });

  test('remove prunes dead branches', () => {
    const t = build(['close', 'cut']);
    t.remove('close');
    expect(t.hasPrefix('cl')).toBe(false);
    expect(t.hasPrefix('c')).toBe(true);
    t.remove('cut');
    expect(t.hasPrefix('')).toBe(false);
    expect(t.size()).toBe(0);
  });

  test('remove of a missing word or a bare prefix returns false', () => {
    const t = build(['open file']);
    expect(t.remove('open')).toBe(false);
    expect(t.remove('zzz')).toBe(false);
    expect(t.size()).toBe(1);
  });

  test('handles a large dictionary', () => {
    const t = new Trie();
    const words = [];
    for (let i = 0; i < 50000; i++) words.push(`item-${i.toString(36)}`);
    words.forEach((w) => t.insert(w));
    expect(t.size()).toBe(50000);
    for (let i = 0; i < 50000; i += 97) expect(t.has(words[i])).toBe(true);
    const expected = words.filter((w) => w.startsWith('item-1a')).sort();
    expect(t.complete('item-1a')).toEqual(expected);
  });
});
