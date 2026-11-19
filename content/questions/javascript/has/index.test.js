import has from './index';

const obj = { a: { b: undefined, c: [10, 20], d: null }, top: 0 };

describe('has', () => {
  test('finds top-level own keys', () => {
    expect(has(obj, 'top')).toBe(true);
    expect(has(obj, 'nope')).toBe(false);
  });

  test('finds nested keys', () => {
    expect(has(obj, 'a.c')).toBe(true);
    expect(has(obj, ['a', 'c'])).toBe(true);
  });

  test('returns true for a key whose value is undefined', () => {
    expect(has(obj, 'a.b')).toBe(true);
  });

  test('returns false for missing nested keys', () => {
    expect(has(obj, 'a.x')).toBe(false);
    expect(has(obj, 'a.x.y')).toBe(false);
  });

  test('supports array indexes in both syntaxes', () => {
    expect(has(obj, 'a.c[1]')).toBe(true);
    expect(has(obj, 'a.c.0')).toBe(true);
    expect(has(obj, 'a.c[5]')).toBe(false);
  });

  test('ignores inherited properties', () => {
    expect(has(obj, 'toString')).toBe(false);
    expect(has(obj, 'a.c.map')).toBe(false);
  });

  test('stops at null values', () => {
    expect(has(obj, 'a.d')).toBe(true);
    expect(has(obj, 'a.d.e')).toBe(false);
  });

  test('handles nullish sources', () => {
    expect(has(null, 'a')).toBe(false);
    expect(has(undefined, 'a')).toBe(false);
  });

  test('empty path is false', () => {
    expect(has(obj, '')).toBe(false);
    expect(has(obj, [])).toBe(false);
  });

  test('works with Object.create(null)', () => {
    const bare = Object.create(null);
    bare.x = { y: 1 };
    expect(has(bare, 'x.y')).toBe(true);
    expect(has(bare, 'x.z')).toBe(false);
  });

  test('does not trust a shadowed hasOwnProperty', () => {
    const tricky = { hasOwnProperty: () => true };
    expect(has(tricky, 'missing')).toBe(false);
  });

  test('sparse array holes are not own properties', () => {
    // eslint-disable-next-line no-sparse-arrays
    expect(has({ arr: [1, , 3] }, 'arr[1]')).toBe(false);
  });
});
