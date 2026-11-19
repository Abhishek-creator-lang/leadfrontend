import pipe from './index';

const double = (n) => n * 2;
const increment = (n) => n + 1;

describe('pipe', () => {
  test('applies functions from left to right', () => {
    expect(pipe(double, increment)(5)).toBe(11);
    expect(pipe(increment, double)(5)).toBe(12);
  });

  test('works for a string pipeline', () => {
    const toSlug = pipe(
      (s) => s.trim(),
      (s) => s.toLowerCase(),
      (s) => s.replace(/\s+/g, '-')
    );
    expect(toSlug('  Hello Big World ')).toBe('hello-big-world');
  });

  test('the first function receives every argument', () => {
    const multiply = jest.fn((a, b) => a * b);
    expect(pipe(multiply, String)(3, 4)).toBe('12');
    expect(multiply).toHaveBeenCalledWith(3, 4);
  });

  test('later functions receive exactly one argument', () => {
    const spy = jest.fn((x) => x);
    pipe((a, b) => a + b, spy)(2, 3);
    expect(spy.mock.calls[0]).toEqual([5]);
  });

  test('no functions returns the first argument', () => {
    expect(pipe()('x', 'y')).toBe('x');
  });

  test('does not run anything until called, and can be reused', () => {
    const fn = jest.fn(increment);
    const p = pipe(fn, double);
    expect(fn).not.toHaveBeenCalled();
    expect(p(1)).toBe(4);
    expect(p(10)).toBe(22);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('forwards `this` to every function', () => {
    const obj = {
      step: 5,
      run: pipe(
        function (x) {
          return x + this.step;
        },
        function (x) {
          return x * this.step;
        }
      ),
    };
    expect(obj.run(1)).toBe(30);
  });

  test('throws a TypeError at creation time for non-functions', () => {
    expect(() => pipe(double, undefined)).toThrow(TypeError);
    expect(() => pipe('nope')).toThrow(TypeError);
  });
});
