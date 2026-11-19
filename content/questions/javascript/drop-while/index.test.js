import dropWhile from './index';

describe('dropWhile', () => {
  test('drops leading elements that match', () => {
    expect(dropWhile([1, 2, 3, 4], (n) => n < 3)).toEqual([3, 4]);
  });

  test('keeps later elements even if they match', () => {
    expect(dropWhile([1, 2, 3, 4, 1], (n) => n < 3)).toEqual([3, 4, 1]);
  });

  test('returns a copy when the first element fails', () => {
    const input = [5, 1, 2];
    const result = dropWhile(input, (n) => n < 3);
    expect(result).toEqual([5, 1, 2]);
    expect(result).not.toBe(input);
  });

  test('returns an empty array when every element matches', () => {
    expect(dropWhile([1, 2], (n) => n < 3)).toEqual([]);
  });

  test('empty array returns empty array without calling predicate', () => {
    const predicate = jest.fn(() => true);
    expect(dropWhile([], predicate)).toEqual([]);
    expect(predicate).not.toHaveBeenCalled();
  });

  test('passes value, index and array to the predicate', () => {
    const input = ['a', 'b'];
    const predicate = jest.fn(() => true);
    dropWhile(input, predicate);
    expect(predicate.mock.calls).toEqual([
      ['a', 0, input],
      ['b', 1, input],
    ]);
  });

  test('stops calling the predicate after the first falsy result', () => {
    const predicate = jest.fn((n) => n < 2);
    dropWhile([0, 1, 2, 0, 1], predicate);
    expect(predicate).toHaveBeenCalledTimes(3);
  });

  test('works with string predicates such as blank lines', () => {
    const lines = ['', '  ', 'title', '', 'body'];
    expect(dropWhile(lines, (l) => l.trim() === '')).toEqual(['title', '', 'body']);
  });

  test('does not mutate the input', () => {
    const input = [1, 2, 3];
    dropWhile(input, (n) => n < 2);
    expect(input).toEqual([1, 2, 3]);
  });
});
