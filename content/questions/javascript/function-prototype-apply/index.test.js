/* eslint-disable no-sparse-arrays */
import myApply from './index';

describe('Function.prototype.myApply', () => {
  function total(a, b, c) {
    return this.base + a + b + c;
  }

  test('is attached to Function.prototype', () => {
    expect(Function.prototype.myApply).toBe(myApply);
  });

  test('sets `this` and spreads the arguments array', () => {
    expect(total.myApply({ base: 10 }, [1, 2, 3])).toBe(16);
  });

  test('works with built-ins that ignore `this`', () => {
    expect(Math.max.myApply(null, [4, 9, 2])).toBe(9);
  });

  test('treats null or undefined argsArray as no arguments', () => {
    const fn = jest.fn(function () {
      return arguments.length;
    });
    expect(fn.myApply({}, null)).toBe(0);
    expect(fn.myApply({})).toBe(0);
  });

  test('accepts array-like objects', () => {
    expect(total.myApply({ base: 0 }, { length: 3, 0: 1, 1: 1, 2: 1 })).toBe(3);
  });

  test('passes holes as undefined arguments', () => {
    function collect(...args) {
      return args;
    }
    const result = collect.myApply(null, [1, , 3]);
    expect(result).toHaveLength(3);
    expect(result[1]).toBeUndefined();
  });

  test('throws a TypeError for a primitive argsArray', () => {
    expect(() => total.myApply({}, 5)).toThrow(TypeError);
    expect(() => total.myApply({}, 'abc')).toThrow(TypeError);
  });

  test('boxes primitive thisArg values', () => {
    function shout() {
      return this.toUpperCase() + '!';
    }
    expect(shout.myApply('hey', [])).toBe('HEY!');
  });

  test('leaves no trace on thisArg and keeps existing keys', () => {
    const target = { fn: 1, base: 0 };
    const keysBefore = Reflect.ownKeys(target);
    total.myApply(target, [1, 2, 3]);
    expect(Reflect.ownKeys(target)).toEqual(keysBefore);
    expect(target.fn).toBe(1);
  });

  test('cleans up and rethrows when the function throws', () => {
    const target = {};
    function fail() {
      throw new RangeError('nope');
    }
    expect(() => fail.myApply(target, [])).toThrow(RangeError);
    expect(Reflect.ownKeys(target)).toEqual([]);
  });

  test('throws a TypeError when not called on a function', () => {
    expect(() => Function.prototype.myApply.call(42, null, [])).toThrow(TypeError);
  });
});
