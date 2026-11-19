import deepOmit from './index';

describe('deepOmit', () => {
  test('removes top-level keys', () => {
    expect(deepOmit({ a: 1, b: 2 }, ['b'])).toEqual({ a: 1 });
  });

  test('removes keys at every depth', () => {
    const input = { a: 1, secret: 's', inner: { secret: 's2', deeper: { secret: 's3', keep: true } } };
    expect(deepOmit(input, ['secret'])).toEqual({ a: 1, inner: { deeper: { keep: true } } });
  });

  test('cleans objects inside arrays', () => {
    const input = { list: [{ id: 1, token: 'x' }, { id: 2 }, [{ token: 'y', v: 3 }]] };
    expect(deepOmit(input, ['token'])).toEqual({ list: [{ id: 1 }, { id: 2 }, [{ v: 3 }]] });
  });

  test('handles a top-level array', () => {
    expect(deepOmit([{ a: 1, b: 2 }, 5, 'x'], ['b'])).toEqual([{ a: 1 }, 5, 'x']);
  });

  test('does not remove array elements by index', () => {
    expect(deepOmit(['a', 'b', 'c'], ['0', '1'])).toEqual(['a', 'b', 'c']);
  });

  test('supports multiple keys', () => {
    expect(deepOmit({ a: 1, b: { c: 2, d: 3 } }, ['a', 'd'])).toEqual({ b: { c: 2 } });
  });

  test('does not mutate the input', () => {
    const input = { a: { b: 1, c: 2 }, list: [{ c: 3 }] };
    deepOmit(input, ['c']);
    expect(input).toEqual({ a: { b: 1, c: 2 }, list: [{ c: 3 }] });
  });

  test('returns fresh plain objects and arrays', () => {
    const input = { nested: { x: 1 }, list: [1, 2] };
    const out = deepOmit(input, []);
    expect(out).toEqual(input);
    expect(out).not.toBe(input);
    expect(out.nested).not.toBe(input.nested);
    expect(out.list).not.toBe(input.list);
  });

  test('passes non-plain objects through by reference', () => {
    const date = new Date(0);
    const map = new Map([['token', 1]]);
    class Box {
      constructor() {
        this.token = 'keep me';
      }
    }
    const box = new Box();
    const out = deepOmit({ date, map, box, token: 'x' }, ['token']);
    expect(out.date).toBe(date);
    expect(out.map).toBe(map);
    expect(out.box).toBe(box);
    expect(out.box.token).toBe('keep me');
    expect('token' in out).toBe(false);
  });

  test('returns primitives unchanged', () => {
    expect(deepOmit(42, ['a'])).toBe(42);
    expect(deepOmit(null, ['a'])).toBeNull();
    expect(deepOmit('str', ['length'])).toBe('str');
  });
});
