import rangeRight from './index';

describe('rangeRight', () => {
  test('one argument', () => {
    expect(rangeRight(4)).toEqual([3, 2, 1, 0]);
  });

  test('one negative argument', () => {
    expect(rangeRight(-4)).toEqual([-3, -2, -1, 0]);
  });

  test('start and end', () => {
    expect(rangeRight(1, 5)).toEqual([4, 3, 2, 1]);
  });

  test('custom step', () => {
    expect(rangeRight(0, 20, 5)).toEqual([15, 10, 5, 0]);
  });

  test('step that does not divide the range stays on the start grid', () => {
    expect(rangeRight(0, 10, 3)).toEqual([9, 6, 3, 0]);
  });

  test('default step is -1 when end < start', () => {
    expect(rangeRight(5, 1)).toEqual([2, 3, 4, 5]);
  });

  test('explicit negative step', () => {
    expect(rangeRight(0, -4, -1)).toEqual([-3, -2, -1, 0]);
  });

  test('wrong-direction step returns []', () => {
    expect(rangeRight(0, 5, -1)).toEqual([]);
  });

  test('zero step repeats start', () => {
    expect(rangeRight(1, 4, 0)).toEqual([1, 1, 1]);
  });

  test('empty ranges', () => {
    expect(rangeRight(0)).toEqual([]);
    expect(rangeRight(2, 2)).toEqual([]);
  });

  test('fractional step', () => {
    expect(rangeRight(0, 1, 0.25)).toEqual([0.75, 0.5, 0.25, 0]);
  });

  test('does not call Array.prototype.reverse', () => {
    const original = Array.prototype.reverse;
    Array.prototype.reverse = function () {
      throw new Error('reverse is not allowed');
    };
    let result;
    try {
      result = rangeRight(3);
    } finally {
      Array.prototype.reverse = original;
    }
    expect(result).toEqual([2, 1, 0]);
  });
});
