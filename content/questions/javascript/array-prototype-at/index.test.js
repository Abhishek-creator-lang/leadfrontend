import myAt from './index';

describe('Array.prototype.myAt', () => {
  const letters = ['a', 'b', 'c', 'd'];

  test('is attached to Array.prototype', () => {
    expect(Array.prototype.myAt).toBe(myAt);
  });

  test('reads non-negative indices', () => {
    expect(letters.myAt(0)).toBe('a');
    expect(letters.myAt(3)).toBe('d');
  });

  test('negative indices count from the end', () => {
    expect(letters.myAt(-1)).toBe('d');
    expect(letters.myAt(-4)).toBe('a');
  });

  test('returns undefined when out of range', () => {
    expect(letters.myAt(4)).toBeUndefined();
    expect(letters.myAt(-5)).toBeUndefined();
    expect(letters.myAt(Infinity)).toBeUndefined();
    expect([].myAt(0)).toBeUndefined();
  });

  test('truncates fractional indices toward zero', () => {
    expect(letters.myAt(1.9)).toBe('b');
    expect(letters.myAt(-1.5)).toBe('d');
    expect(letters.myAt(-0.5)).toBe('a');
  });

  test('coerces the index to a number, with NaN treated as 0', () => {
    expect(letters.myAt('2')).toBe('c');
    expect(letters.myAt()).toBe('a');
    expect(letters.myAt('hello')).toBe('a');
    expect(letters.myAt(null)).toBe('a');
  });

  test('reads holes in sparse arrays as undefined', () => {
    // eslint-disable-next-line no-sparse-arrays
    const sparse = [1, , 3];
    expect(sparse.myAt(1)).toBeUndefined();
    expect(sparse.myAt(-1)).toBe(3);
  });

  test('works on array-like objects and strings', () => {
    const arrayLike = { length: 3, 0: 'x', 1: 'y', 2: 'z' };
    expect(Array.prototype.myAt.call(arrayLike, -1)).toBe('z');
    expect(Array.prototype.myAt.call('hello', -2)).toBe('l');
  });

  test('throws a TypeError for a null or undefined receiver', () => {
    expect(() => Array.prototype.myAt.call(null, 0)).toThrow(TypeError);
    expect(() => Array.prototype.myAt.call(undefined, 0)).toThrow(TypeError);
  });

  test('does not mutate the array', () => {
    const arr = [1, 2, 3];
    arr.myAt(-1);
    expect(arr).toEqual([1, 2, 3]);
  });
});
