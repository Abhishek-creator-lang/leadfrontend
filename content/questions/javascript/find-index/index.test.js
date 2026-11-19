import findIndex from './index';

const users = [
  { name: 'ada', active: false },
  { name: 'bob', active: true },
  { name: 'cy', active: true },
];

describe('findIndex', () => {
  test('returns the index of the first match', () => {
    expect(findIndex(users, (u) => u.active)).toBe(1);
  });

  test('returns -1 when nothing matches', () => {
    expect(findIndex(users, (u) => u.name === 'zed')).toBe(-1);
  });

  test('can match index 0', () => {
    expect(findIndex([5, 6], (n) => n === 5)).toBe(0);
  });

  test('starts searching at fromIndex', () => {
    expect(findIndex(users, (u) => u.active, 2)).toBe(2);
    expect(findIndex([1, 2, 1], (n) => n === 1, 1)).toBe(2);
  });

  test('negative fromIndex counts from the end', () => {
    expect(findIndex([1, 2, 3, 4], (n) => n % 2 === 0, -2)).toBe(3);
  });

  test('negative fromIndex below the start is clamped to 0', () => {
    expect(findIndex([2, 3], (n) => n === 2, -10)).toBe(0);
  });

  test('fromIndex past the end returns -1', () => {
    const predicate = jest.fn(() => true);
    expect(findIndex([1, 2], predicate, 5)).toBe(-1);
    expect(predicate).not.toHaveBeenCalled();
  });

  test('passes value, index and array, and stops at the first match', () => {
    const input = ['a', 'b', 'c'];
    const predicate = jest.fn((v) => v === 'b');
    findIndex(input, predicate);
    expect(predicate.mock.calls).toEqual([
      ['a', 0, input],
      ['b', 1, input],
    ]);
  });

  test('empty array returns -1', () => {
    expect(findIndex([], () => true)).toBe(-1);
  });

  test('can find NaN with a predicate', () => {
    expect(findIndex([1, NaN, 3], Number.isNaN)).toBe(1);
  });

  test('does not use Array.prototype.findIndex', () => {
    const original = Array.prototype.findIndex;
    Array.prototype.findIndex = function () {
      throw new Error('Array.prototype.findIndex is not allowed');
    };
    let result;
    try {
      result = findIndex([1, 2], (n) => n === 2);
    } finally {
      Array.prototype.findIndex = original;
    }
    expect(result).toBe(1);
  });
});
