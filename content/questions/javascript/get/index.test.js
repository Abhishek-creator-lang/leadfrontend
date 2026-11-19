import get from './index';

const data = {
  name: 'Ada',
  address: { city: 'London', geo: { lat: 51.5 } },
  roles: [{ id: 'admin' }, { id: 'editor' }],
  matrix: [
    [1, 2],
    [3, 4],
  ],
  flags: { off: false, zero: 0, empty: '', nothing: null },
};

describe('get', () => {
  test('reads a top-level key', () => {
    expect(get(data, 'name')).toBe('Ada');
  });

  test('reads a nested key with a dot path', () => {
    expect(get(data, 'address.geo.lat')).toBe(51.5);
  });

  test('accepts an array path', () => {
    expect(get(data, ['address', 'city'])).toBe('London');
    expect(get(data, ['roles', 0, 'id'])).toBe('admin');
  });

  test('supports bracket indexes', () => {
    expect(get(data, 'roles[1].id')).toBe('editor');
    expect(get(data, 'matrix[1][0]')).toBe(3);
  });

  test('supports numeric segments in dot notation', () => {
    expect(get(data, 'roles.0.id')).toBe('admin');
  });

  test('returns undefined for a missing path without throwing', () => {
    expect(get(data, 'phone.mobile.number')).toBeUndefined();
  });

  test('returns the default for a missing path', () => {
    expect(get(data, 'address.zip', 'n/a')).toBe('n/a');
    expect(get(data, 'phone.mobile', 'none')).toBe('none');
  });

  test('does not use the default for falsy but defined values', () => {
    expect(get(data, 'flags.off', 'x')).toBe(false);
    expect(get(data, 'flags.zero', 'x')).toBe(0);
    expect(get(data, 'flags.empty', 'x')).toBe('');
    expect(get(data, 'flags.nothing', 'x')).toBeNull();
  });

  test('stops at null in the middle of the path', () => {
    expect(get(data, 'flags.nothing.deeper', 'd')).toBe('d');
  });

  test('handles a null or undefined source object', () => {
    expect(get(null, 'a.b', 1)).toBe(1);
    expect(get(undefined, 'a')).toBeUndefined();
  });

  test('empty path returns the default', () => {
    expect(get(data, '', 'd')).toBe('d');
    expect(get(data, [], 'd')).toBe('d');
  });

  test('reads inherited properties such as length', () => {
    expect(get('abc', 'length')).toBe(3);
    expect(get(data, 'roles.length')).toBe(2);
  });
});
