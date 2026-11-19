import findLastIndex from './index';

const events = [
  { type: 'click', at: 1 },
  { type: 'save', at: 2 },
  { type: 'click', at: 3 },
  { type: 'scroll', at: 4 },
];

describe('findLastIndex', () => {
  test('returns the index of the last match', () => {
    expect(findLastIndex(events, (e) => e.type === 'click')).toBe(2);
  });

  test('returns -1 when nothing matches', () => {
    expect(findLastIndex(events, (e) => e.type === 'drag')).toBe(-1);
  });

  test('searches backwards from fromIndex', () => {
    expect(findLastIndex(events, (e) => e.type === 'click', 1)).toBe(0);
  });

  test('negative fromIndex counts from the end', () => {
    expect(findLastIndex(events, (e) => e.type === 'save', -3)).toBe(1);
    expect(findLastIndex(events, (e) => e.type === 'scroll', -2)).toBe(-1);
  });

  test('negative fromIndex before the start returns -1 without calling predicate', () => {
    const predicate = jest.fn(() => true);
    expect(findLastIndex([1, 2], predicate, -10)).toBe(-1);
    expect(predicate).not.toHaveBeenCalled();
  });

  test('fromIndex past the end is clamped to the last index', () => {
    const input = [1, 2, 3];
    const predicate = jest.fn(() => false);
    expect(findLastIndex(input, predicate, 10)).toBe(-1);
    expect(predicate.mock.calls.map((c) => c[1])).toEqual([2, 1, 0]);
  });

  test('visits in descending order with value, index and array', () => {
    const input = ['a', 'b', 'c'];
    const predicate = jest.fn((v) => v === 'b');
    expect(findLastIndex(input, predicate)).toBe(1);
    expect(predicate.mock.calls).toEqual([
      ['c', 2, input],
      ['b', 1, input],
    ]);
  });

  test('empty array returns -1', () => {
    expect(findLastIndex([], () => true)).toBe(-1);
  });

  test('does not mutate the input', () => {
    const input = [1, 2, 3];
    findLastIndex(input, (n) => n === 1);
    expect(input).toEqual([1, 2, 3]);
  });

  test('does not use Array.prototype.findLastIndex', () => {
    const original = Array.prototype.findLastIndex;
    Array.prototype.findLastIndex = function () {
      throw new Error('Array.prototype.findLastIndex is not allowed');
    };
    let result;
    try {
      result = findLastIndex([2, 1, 2], (n) => n === 2);
    } finally {
      Array.prototype.findLastIndex = original;
    }
    expect(result).toBe(2);
  });
});
