import set from './index';

describe('set', () => {
  test('overwrites an existing nested value', () => {
    const obj = { a: { b: 1 } };
    set(obj, 'a.b', 2);
    expect(obj).toEqual({ a: { b: 2 } });
  });

  test('returns the same object reference', () => {
    const obj = {};
    expect(set(obj, 'a', 1)).toBe(obj);
  });

  test('creates missing objects', () => {
    const obj = {};
    set(obj, 'a.b.c', 'deep');
    expect(obj).toEqual({ a: { b: { c: 'deep' } } });
  });

  test('creates arrays when the next key is an index (bracket syntax)', () => {
    const obj = {};
    set(obj, 'list[0].name', 'x');
    expect(Array.isArray(obj.list)).toBe(true);
    expect(obj.list[0]).toEqual({ name: 'x' });
  });

  test('creates arrays for numeric keys in an array path', () => {
    const obj = {};
    set(obj, ['x', 1], true);
    expect(Array.isArray(obj.x)).toBe(true);
    expect(obj.x).toHaveLength(2);
    expect(obj.x[1]).toBe(true);
  });

  test('treats dot-numeric segments as indexes too', () => {
    const obj = {};
    set(obj, 'm.0.1', 'v');
    expect(Array.isArray(obj.m)).toBe(true);
    expect(Array.isArray(obj.m[0])).toBe(true);
    expect(obj.m[0][1]).toBe('v');
  });

  test('reuses existing containers', () => {
    const inner = { keep: true };
    const obj = { a: inner };
    set(obj, 'a.added', 1);
    expect(obj.a).toBe(inner);
    expect(inner).toEqual({ keep: true, added: 1 });
  });

  test('replaces primitive intermediates with containers', () => {
    const obj = { a: 5, b: null };
    set(obj, 'a.x', 1);
    set(obj, 'b[2]', 'z');
    expect(obj.a).toEqual({ x: 1 });
    expect(Array.isArray(obj.b)).toBe(true);
    expect(obj.b[2]).toBe('z');
  });

  test('non-index numeric-looking keys create objects', () => {
    const obj = {};
    set(obj, 'a.01', 1);
    expect(Array.isArray(obj.a)).toBe(false);
    expect(obj.a['01']).toBe(1);
  });

  test('empty path and nullish object are no-ops', () => {
    const obj = { a: 1 };
    expect(set(obj, '', 2)).toEqual({ a: 1 });
    expect(set(obj, [], 2)).toEqual({ a: 1 });
    expect(set(null, 'a', 1)).toBeNull();
    expect(set(undefined, 'a', 1)).toBeUndefined();
  });

  test('refuses to pollute prototypes', () => {
    const obj = {};
    set(obj, '__proto__.polluted', 'yes');
    set(obj, 'constructor.prototype.polluted2', 'yes');
    set(obj, ['__proto__', 'polluted3'], 'yes');
    expect({}.polluted).toBeUndefined();
    expect({}.polluted2).toBeUndefined();
    expect({}.polluted3).toBeUndefined();
    expect(Object.keys(obj)).toEqual([]);
  });
});
