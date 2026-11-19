/* eslint-disable no-sparse-arrays */
import myConcat from './index';

describe('Array.prototype.myConcat', () => {
  test('is attached to Array.prototype', () => {
    expect(Array.prototype.myConcat).toBe(myConcat);
  });

  test('joins arrays and plain values', () => {
    expect([1, 2].myConcat([3, 4], 5)).toEqual([1, 2, 3, 4, 5]);
    expect([].myConcat(1, 'two', null, undefined)).toEqual([1, 'two', null, undefined]);
  });

  test('with no arguments returns a new shallow copy', () => {
    const inner = { a: 1 };
    const original = [inner, 2];
    const copy = original.myConcat();
    expect(copy).toEqual(original);
    expect(copy).not.toBe(original);
    expect(copy[0]).toBe(inner);
  });

  test('spreads only one level deep', () => {
    expect([1].myConcat([[2, [3]]], [4])).toEqual([1, [2, [3]], 4]);
  });

  test('does not mutate the receiver or the arguments', () => {
    const a = [1, 2];
    const b = [3];
    a.myConcat(b, 4);
    expect(a).toEqual([1, 2]);
    expect(b).toEqual([3]);
  });

  test('does not spread strings or plain array-like objects', () => {
    const arrayLike = { length: 2, 0: 'a', 1: 'b' };
    const result = [0].myConcat('xy', arrayLike);
    expect(result).toHaveLength(3);
    expect(result[1]).toBe('xy');
    expect(result[2]).toBe(arrayLike);
  });

  test('preserves holes, including trailing ones', () => {
    const result = [1, , 3].myConcat([4, , ], 5);
    expect(result).toHaveLength(6);
    expect(1 in result).toBe(false);
    expect(4 in result).toBe(false);
    expect(result[2]).toBe(3);
    expect(result[3]).toBe(4);
    expect(result[5]).toBe(5);

    const trailing = [1, , ].myConcat();
    expect(trailing).toHaveLength(2);
    expect(1 in trailing).toBe(false);
  });

  test('spreads array-like objects that opt in via Symbol.isConcatSpreadable', () => {
    const arrayLike = { length: 2, 0: 'a', 1: 'b', [Symbol.isConcatSpreadable]: true };
    expect([0].myConcat(arrayLike)).toEqual([0, 'a', 'b']);
  });

  test('appends arrays that opt out via Symbol.isConcatSpreadable', () => {
    const optedOut = [1, 2];
    optedOut[Symbol.isConcatSpreadable] = false;
    const result = [0].myConcat(optedOut);
    expect(result).toHaveLength(2);
    expect(result[1]).toBe(optedOut);
  });

  test('applies the same rule to the receiver', () => {
    const arrayLike = { length: 1, 0: 'a' };
    const result = Array.prototype.myConcat.call(arrayLike, [1]);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(arrayLike);
    expect(result[1]).toBe(1);
  });
});
