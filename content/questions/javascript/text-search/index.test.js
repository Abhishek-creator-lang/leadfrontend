import textSearch from './index';

describe('textSearch', () => {
  test('highlights a single match', () => {
    expect(textSearch('The quick brown fox', 'quick')).toBe('The <b>quick</b> brown fox');
  });

  test('is case-insensitive and keeps original casing', () => {
    expect(textSearch('The Quick brown fox', 'QUICK')).toBe('The <b>Quick</b> brown fox');
  });

  test('highlights every occurrence', () => {
    expect(textSearch('ab ab ab', 'ab')).toBe('<b>ab</b> <b>ab</b> <b>ab</b>');
  });

  test('merges overlapping matches', () => {
    expect(textSearch('aaa', 'aa')).toBe('<b>aaa</b>');
  });

  test('merges adjacent matches from different words', () => {
    expect(textSearch('foobar', 'foo bar')).toBe('<b>foobar</b>');
  });

  test('handles several separate words', () => {
    expect(textSearch('one two three', 'one three')).toBe('<b>one</b> two <b>three</b>');
  });

  test('merges partially overlapping words', () => {
    expect(textSearch('abcdef', 'abcd cdef')).toBe('<b>abcdef</b>');
  });

  test('treats special characters literally', () => {
    expect(textSearch('price: $5.00', '5.0')).toBe('price: $<b>5.0</b>0');
    expect(textSearch('a+b or ab', 'a+b')).toBe('<b>a+b</b> or ab');
  });

  test('empty or whitespace-only query returns text unchanged', () => {
    expect(textSearch('hello', '')).toBe('hello');
    expect(textSearch('hello', '   ')).toBe('hello');
  });

  test('no match returns text unchanged', () => {
    expect(textSearch('hello', 'xyz')).toBe('hello');
  });

  test('ignores extra whitespace between query words', () => {
    expect(textSearch('red green blue', '  red   blue ')).toBe('<b>red</b> green <b>blue</b>');
  });

  test('match at the very end is closed', () => {
    expect(textSearch('say hello', 'hello')).toBe('say <b>hello</b>');
  });
});
