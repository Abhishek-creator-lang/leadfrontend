import curry from './index';

const _ = curry.placeholder;
const join = (a, b, c) => `${a}-${b}-${c}`;

describe('curry with placeholders', () => {
  test('all arguments at once', () => {
    expect(curry(join)(1, 2, 3)).toBe('1-2-3');
  });

  test('one argument at a time and in groups', () => {
    const c = curry(join);
    expect(c(1)(2)(3)).toBe('1-2-3');
    expect(c(1, 2)(3)).toBe('1-2-3');
    expect(c(1)(2, 3)).toBe('1-2-3');
  });

  test('a placeholder is filled by the next call before appending', () => {
    expect(curry(join)(_, 2)(1, 3)).toBe('1-2-3');
    expect(curry(join)(_, 2)(1)(3)).toBe('1-2-3');
  });

  test('several holes are filled left to right', () => {
    expect(curry(join)(_, _, 3)(1)(2)).toBe('1-2-3');
    expect(curry(join)(_, _, 3)(1, 2)).toBe('1-2-3');
  });

  test('a placeholder passed later keeps a hole open', () => {
    expect(curry(join)(_, _, 3)(_, 2)(1)).toBe('1-2-3');
    expect(curry(join)(1)(_, 3)(2)).toBe('1-2-3');
  });

  test('does not invoke while required positions hold placeholders', () => {
    const fn = jest.fn(join);
    const c = curry(fn);
    const partial = c(_, _, _);
    expect(typeof partial).toBe('function');
    expect(fn).not.toHaveBeenCalled();
    expect(partial(1, 2, 3)).toBe('1-2-3');
  });

  test('partial applications are reusable', () => {
    const c = curry(join)(_, 'x');
    expect(c('a')('b')).toBe('a-x-b');
    expect(c('c', 'd')).toBe('c-x-d');
    expect(c(_, 'e')('f')).toBe('f-x-e');
  });

  test('extra arguments are passed through', () => {
    const c = curry(function (a, b) {
      return Array.from(arguments);
    });
    expect(c(1)(2, 3, 4)).toEqual([1, 2, 3, 4]);
  });

  test('forwards `this` from the final call', () => {
    const obj = {
      base: 10,
      add: curry(function (a, b) {
        return this.base + a + b;
      }),
    };
    expect(obj.add(1, 2)).toBe(13);
  });

  test('zero-arity functions are invoked immediately', () => {
    const fn = jest.fn(() => 'done');
    expect(curry(fn)()).toBe('done');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('exposes the placeholder', () => {
    expect(typeof curry.placeholder).toBe('symbol');
  });
});
