import compose from './index';

const double = (n) => n * 2;
const increment = (n) => n + 1;

describe('compose', () => {
  test('returns a function', () => {
    expect(typeof compose(double)).toBe('function');
  });

  test('applies functions from right to left', () => {
    expect(compose(double, increment)(5)).toBe(12);
    expect(compose(increment, double)(5)).toBe(11);
  });

  test('works with a single function', () => {
    expect(compose(double)(4)).toBe(8);
  });

  test('chains many functions', () => {
    const toStr = (n) => `#${n}`;
    expect(compose(toStr, double, increment, increment)(1)).toBe('#6');
  });

  test('the rightmost function receives every argument', () => {
    const sum = jest.fn((a, b, c) => a + b + c);
    expect(compose(double, sum)(1, 2, 3)).toBe(12);
    expect(sum).toHaveBeenCalledWith(1, 2, 3);
  });

  test('other functions receive exactly one argument', () => {
    const spy = jest.fn((x) => x);
    compose(spy, (a, b) => a + b)(1, 2);
    expect(spy.mock.calls[0]).toEqual([3]);
  });

  test('no functions returns the first argument', () => {
    expect(compose()(7)).toBe(7);
    expect(compose()('a', 'b')).toBe('a');
  });

  test('does not call anything until invoked', () => {
    const fn = jest.fn((x) => x);
    const composed = compose(fn, fn);
    expect(fn).not.toHaveBeenCalled();
    composed(1);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('can be called repeatedly', () => {
    const composed = compose(double, increment);
    expect(composed(1)).toBe(4);
    expect(composed(2)).toBe(6);
  });

  test('forwards `this` to every function', () => {
    const obj = {
      factor: 3,
      run: compose(
        function (x) {
          return x * this.factor;
        },
        function (x) {
          return x + this.factor;
        }
      ),
    };
    expect(obj.run(1)).toBe(12);
  });
});
