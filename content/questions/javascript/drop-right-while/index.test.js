import dropRightWhile from './index';

describe('dropRightWhile', () => {
  test('drops trailing elements that match', () => {
    expect(dropRightWhile([1, 2, 3, 4], (n) => n > 2)).toEqual([1, 2]);
  });

  test('keeps earlier elements even if they match', () => {
    expect(dropRightWhile([5, 1, 6, 7], (n) => n > 2)).toEqual([5, 1]);
  });

  test('returns a copy when the last element fails', () => {
    const input = [1, 2];
    const result = dropRightWhile(input, (n) => n > 2);
    expect(result).toEqual([1, 2]);
    expect(result).not.toBe(input);
  });

  test('returns an empty array when every element matches', () => {
    expect(dropRightWhile([3, 4], (n) => n > 2)).toEqual([]);
  });

  test('empty array returns empty array without calling predicate', () => {
    const predicate = jest.fn(() => true);
    expect(dropRightWhile([], predicate)).toEqual([]);
    expect(predicate).not.toHaveBeenCalled();
  });

  test('visits from the end and passes the original index', () => {
    const input = ['a', 'b', 'c'];
    const predicate = jest.fn(() => true);
    dropRightWhile(input, predicate);
    expect(predicate.mock.calls).toEqual([
      ['c', 2, input],
      ['b', 1, input],
      ['a', 0, input],
    ]);
  });

  test('stops calling the predicate after the first falsy result', () => {
    const predicate = jest.fn((n) => n > 2);
    dropRightWhile([9, 1, 3, 4], predicate);
    expect(predicate).toHaveBeenCalledTimes(3);
  });

  test('trims trailing empty rows', () => {
    const rows = [['a', 1], ['b', 2], [], []];
    expect(dropRightWhile(rows, (row) => row.length === 0)).toEqual([
      ['a', 1],
      ['b', 2],
    ]);
  });

  test('does not mutate the input', () => {
    const input = [1, 2, 3];
    dropRightWhile(input, (n) => n > 1);
    expect(input).toEqual([1, 2, 3]);
  });
});
