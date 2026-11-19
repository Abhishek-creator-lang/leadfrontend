import omit from './index';

describe('omit', () => {
  test('removes the listed keys', () => {
    expect(omit({ a: 1, b: 2, c: 3 }, ['a', 'c'])).toEqual({ b: 2 });
  });

  test('ignores keys that do not exist', () => {
    expect(omit({ a: 1, b: 2 }, ['z'])).toEqual({ a: 1, b: 2 });
  });

  test('returns a new object even when nothing is omitted', () => {
    const src = { a: 1 };
    const result = omit(src, []);
    expect(result).toEqual({ a: 1 });
    expect(result).not.toBe(src);
  });

  test('does not mutate the input', () => {
    const src = { a: 1, b: 2 };
    omit(src, ['a']);
    expect(src).toEqual({ a: 1, b: 2 });
  });

  test('keeps falsy values that are not omitted', () => {
    expect(omit({ a: 0, b: '', c: null, d: undefined, e: false }, ['e'])).toEqual({
      a: 0,
      b: '',
      c: null,
      d: undefined,
    });
    expect(Object.keys(omit({ d: undefined }, []))).toEqual(['d']);
  });

  test('is shallow', () => {
    const nested = { x: 1 };
    expect(omit({ nested, other: 1 }, ['other']).nested).toBe(nested);
  });

  test('treats dotted keys literally', () => {
    expect(omit({ 'a.b': 1, a: { b: 2 } }, ['a.b'])).toEqual({ a: { b: 2 } });
  });

  test('does not copy inherited properties', () => {
    const child = Object.create({ inherited: 1 });
    child.own = 2;
    expect(omit(child, [])).toEqual({ own: 2 });
    expect(Object.prototype.hasOwnProperty.call(omit(child, []), 'inherited')).toBe(false);
  });

  test('works with numeric-like keys', () => {
    expect(omit({ 1: 'a', 2: 'b' }, ['1'])).toEqual({ 2: 'b' });
  });

  test('nullish input gives {}', () => {
    expect(omit(null, ['a'])).toEqual({});
    expect(omit(undefined, [])).toEqual({});
  });
});
