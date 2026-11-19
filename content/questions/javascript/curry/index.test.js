import curry from './index';

function volume(length, width, height) {
  return length * width * height;
}

describe('curry', () => {
  test('returns a function', () => {
    expect(typeof curry(volume)).toBe('function');
  });

  test('all arguments at once', () => {
    expect(curry(volume)(2, 3, 4)).toBe(24);
  });

  test('one argument at a time', () => {
    expect(curry(volume)(2)(3)(4)).toBe(24);
  });

  test('mixed groupings', () => {
    const curried = curry(volume);
    expect(curried(2, 3)(4)).toBe(24);
    expect(curried(2)(3, 4)).toBe(24);
  });

  test('does not call func until enough arguments are collected', () => {
    const fn = jest.fn((a, b) => a + b);
    const curried = curry(fn);
    const partial = curried(1);
    expect(fn).not.toHaveBeenCalled();
    expect(partial(2)).toBe(3);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('partially applied functions are reusable', () => {
    const base = curry(volume)(2);
    expect(base(3)(4)).toBe(24);
    expect(base(5)(1)).toBe(10);
    const pair = base(3);
    expect(pair(1)).toBe(6);
    expect(pair(10)).toBe(60);
  });

  test('empty calls do not consume anything', () => {
    expect(curry(volume)()(2)()(3, 4)).toBe(24);
  });

  test('passes extra arguments through', () => {
    const fn = jest.fn((a, b) => a + b);
    curry(fn)(1)(2, 3, 4);
    expect(fn).toHaveBeenCalledWith(1, 2, 3, 4);
  });

  test('zero-arity functions are invoked immediately', () => {
    const fn = jest.fn(() => 'done');
    expect(curry(fn)()).toBe('done');
  });

  test('forwards this from the final call', () => {
    const obj = {
      factor: 10,
      scale: curry(function (a, b) {
        return (a + b) * this.factor;
      }),
    };
    expect(obj.scale(1, 2)).toBe(30);
  });
});
