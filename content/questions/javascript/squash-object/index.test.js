import squashObject from './index';

describe('squashObject', () => {
  test('empty object', () => {
    expect(squashObject({})).toEqual({});
  });

  test('flat object is copied', () => {
    const input = { a: 1, b: 'two' };
    const result = squashObject(input);
    expect(result).toEqual({ a: 1, b: 'two' });
    expect(result).not.toBe(input);
  });

  test('nested objects become dot paths', () => {
    expect(squashObject({ a: { b: { c: 1 }, d: 2 }, e: 3 })).toEqual({ 'a.b.c': 1, 'a.d': 2, e: 3 });
  });

  test('array indexes become path segments', () => {
    expect(squashObject({ tags: ['x', 'y'], list: [{ id: 1 }, [2, 3]] })).toEqual({
      'tags.0': 'x',
      'tags.1': 'y',
      'list.0.id': 1,
      'list.1.0': 2,
      'list.1.1': 3,
    });
  });

  test('null and undefined are leaves', () => {
    expect(squashObject({ a: null, b: { c: undefined } })).toEqual({ a: null, 'b.c': undefined });
    expect(Object.keys(squashObject({ b: { c: undefined } }))).toEqual(['b.c']);
  });

  test('empty containers produce no keys', () => {
    expect(squashObject({ a: {}, b: [], c: { d: {} }, e: 1 })).toEqual({ e: 1 });
  });

  test('empty-string keys are skipped in the path', () => {
    expect(squashObject({ a: { '': { b: 1 } } })).toEqual({ 'a.b': 1 });
    expect(squashObject({ '': 1 })).toEqual({ '': 1 });
    expect(squashObject({ a: { '': 2 } })).toEqual({ a: 2 });
  });

  test('non-plain objects are leaves kept by reference', () => {
    const date = new Date(0);
    const map = new Map();
    const result = squashObject({ meta: { created: date, index: map } });
    expect(result['meta.created']).toBe(date);
    expect(result['meta.index']).toBe(map);
  });

  test('functions are leaves', () => {
    const fn = () => {};
    expect(squashObject({ handlers: { onClick: fn } })).toEqual({ 'handlers.onClick': fn });
  });

  test('does not mutate the input', () => {
    const input = { a: { b: [1, 2] } };
    squashObject(input);
    expect(input).toEqual({ a: { b: [1, 2] } });
  });
});
