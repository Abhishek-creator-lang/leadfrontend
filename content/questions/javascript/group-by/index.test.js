import groupBy from './index';

describe('groupBy', () => {
  test('groups with a function iteratee', () => {
    expect(groupBy([6.1, 4.2, 6.3], Math.floor)).toEqual({ 4: [4.2], 6: [6.1, 6.3] });
  });

  test('groups with a property-name iteratee', () => {
    expect(groupBy(['one', 'two', 'three'], 'length')).toEqual({
      3: ['one', 'two'],
      5: ['three'],
    });
  });

  test('groups objects and keeps original order and references', () => {
    const t1 = { id: 1, owner: 'ana' };
    const t2 = { id: 2, owner: 'ben' };
    const t3 = { id: 3, owner: 'ana' };
    const result = groupBy([t1, t2, t3], (t) => t.owner);
    expect(result).toEqual({ ana: [t1, t3], ben: [t2] });
    expect(result.ana[0]).toBe(t1);
    expect(result.ana[1]).toBe(t3);
  });

  test('empty array returns an empty object', () => {
    expect(groupBy([], (x) => x)).toEqual({});
  });

  test('keys are stringified', () => {
    const result = groupBy([1, '1', null, undefined, true], (x) => x);
    expect(result).toEqual({
      1: [1, '1'],
      null: [null],
      undefined: [undefined],
      true: [true],
    });
  });

  test('calls the iteratee once per element with the element only', () => {
    const fn = jest.fn((x) => x % 2);
    groupBy([1, 2, 3], fn);
    expect(fn.mock.calls).toEqual([[1], [2], [3]]);
  });

  test('missing properties are grouped under "undefined"', () => {
    const a = { kind: 'x' };
    const b = {};
    expect(groupBy([a, b], 'kind')).toEqual({ x: [a], undefined: [b] });
  });

  test('handles keys that exist on Object.prototype', () => {
    const words = ['constructor', 'toString', 'constructor', 'hasOwnProperty'];
    const result = groupBy(words, (w) => w);
    expect(result.constructor).toEqual(['constructor', 'constructor']);
    expect(result.toString).toEqual(['toString']);
    expect(result.hasOwnProperty).toEqual(['hasOwnProperty']);
  });

  test('does not mutate the input', () => {
    const input = [3, 1, 2];
    groupBy(input, (x) => x > 1);
    expect(input).toEqual([3, 1, 2]);
  });

  test('does not use Object.groupBy', () => {
    const original = Object.groupBy;
    Object.groupBy = () => {
      throw new Error('Object.groupBy is not allowed');
    };
    let result;
    try {
      result = groupBy([1, 2, 3], (n) => (n > 1 ? 'big' : 'small'));
    } finally {
      Object.groupBy = original;
    }
    expect(result).toEqual({ small: [1], big: [2, 3] });
  });
});
