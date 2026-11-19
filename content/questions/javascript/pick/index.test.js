import pick from './index';

const user = { id: 1, name: 'Ada', email: 'ada@example.com', password: 'secret' };

describe('pick', () => {
  test('picks the listed keys', () => {
    expect(pick(user, ['id', 'name'])).toEqual({ id: 1, name: 'Ada' });
  });

  test('skips keys that do not exist', () => {
    const result = pick(user, ['id', 'missing']);
    expect(result).toEqual({ id: 1 });
    expect(Object.keys(result)).toEqual(['id']);
  });

  test('empty key list gives an empty object', () => {
    expect(pick(user, [])).toEqual({});
  });

  test('returns a new object and does not mutate the source', () => {
    const copy = { ...user };
    const result = pick(user, ['id']);
    expect(result).not.toBe(user);
    expect(user).toEqual(copy);
  });

  test('copies keys whose value is undefined', () => {
    const result = pick({ a: undefined, b: 1 }, ['a']);
    expect(Object.keys(result)).toEqual(['a']);
    expect(result.a).toBeUndefined();
  });

  test('is shallow: nested objects are shared', () => {
    const src = { nested: { x: 1 } };
    expect(pick(src, ['nested']).nested).toBe(src.nested);
  });

  test('treats dotted keys literally', () => {
    expect(pick({ 'a.b': 1, a: { b: 2 } }, ['a.b'])).toEqual({ 'a.b': 1 });
  });

  test('ignores inherited properties', () => {
    const proto = { inherited: true };
    const child = Object.create(proto);
    child.own = 1;
    expect(pick(child, ['own', 'inherited'])).toEqual({ own: 1 });
  });

  test('nullish source gives {}', () => {
    expect(pick(null, ['a'])).toEqual({});
    expect(pick(undefined, ['a'])).toEqual({});
  });
});
