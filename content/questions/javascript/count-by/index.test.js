import countBy from './index';

describe('countBy', () => {
  test('counts with a function iteratee', () => {
    expect(countBy([6.1, 4.2, 6.3], Math.floor)).toEqual({ 4: 1, 6: 2 });
  });

  test('counts with a property-name iteratee', () => {
    expect(countBy(['one', 'two', 'three'], 'length')).toEqual({ 3: 2, 5: 1 });
  });

  test('counts objects by a field', () => {
    const orders = [
      { id: 1, status: 'paid' },
      { id: 2, status: 'pending' },
      { id: 3, status: 'paid' },
    ];
    expect(countBy(orders, (o) => o.status)).toEqual({ paid: 2, pending: 1 });
  });

  test('empty array returns an empty object', () => {
    expect(countBy([], (x) => x)).toEqual({});
  });

  test('keys are stringified', () => {
    const result = countBy([1, '1', true, null, undefined], (x) => x);
    expect(result).toEqual({ 1: 2, true: 1, null: 1, undefined: 1 });
    expect(Object.keys(result).every((k) => typeof k === 'string')).toBe(true);
  });

  test('calls the iteratee with the element only', () => {
    const fn = jest.fn((x) => x);
    countBy(['a', 'b'], fn);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn.mock.calls[0]).toEqual(['a']);
    expect(fn.mock.calls[1]).toEqual(['b']);
  });

  test('missing properties are grouped under "undefined"', () => {
    expect(countBy([{ a: 1 }, {}, {}], 'a')).toEqual({ 1: 1, undefined: 2 });
  });

  test('handles keys that exist on Object.prototype', () => {
    const result = countBy(['constructor', 'toString', 'constructor', 'valueOf'], (x) => x);
    expect(result.constructor).toBe(2);
    expect(result.toString).toBe(1);
    expect(result.valueOf).toBe(1);
  });

  test('does not mutate the input', () => {
    const input = [1, 2, 2];
    countBy(input, (x) => x);
    expect(input).toEqual([1, 2, 2]);
  });
});
