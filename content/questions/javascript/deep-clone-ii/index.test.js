import deepClone from './index';

describe('deepClone (graphs and built-ins)', () => {
  test('clones plain nested data without sharing', () => {
    const src = { a: { b: [1, { c: 2 }] } };
    const copy = deepClone(src);
    expect(copy).toEqual(src);
    expect(copy.a).not.toBe(src.a);
    expect(copy.a.b[1]).not.toBe(src.a.b[1]);
  });

  test('handles a direct self-reference', () => {
    const src = { name: 'loop' };
    src.self = src;
    const copy = deepClone(src);
    expect(copy).not.toBe(src);
    expect(copy.self).toBe(copy);
  });

  test('handles indirect cycles through arrays', () => {
    const parent = { children: [] };
    const child = { parent };
    parent.children.push(child);
    const copy = deepClone(parent);
    expect(copy.children[0].parent).toBe(copy);
    expect(copy.children[0]).not.toBe(child);
  });

  test('preserves shared references', () => {
    const shared = { n: 1 };
    const copy = deepClone({ x: shared, y: [shared] });
    expect(copy.x).toBe(copy.y[0]);
    expect(copy.x).not.toBe(shared);
  });

  test('clones Dates', () => {
    const date = new Date('2024-01-01T00:00:00Z');
    const copy = deepClone({ date });
    expect(copy.date).toBeInstanceOf(Date);
    expect(copy.date).not.toBe(date);
    expect(copy.date.getTime()).toBe(date.getTime());
  });

  test('clones RegExps including flags and lastIndex', () => {
    const re = /ab+c/gi;
    re.lastIndex = 3;
    const copy = deepClone(re);
    expect(copy).toBeInstanceOf(RegExp);
    expect(copy).not.toBe(re);
    expect(copy.source).toBe('ab+c');
    expect(copy.flags).toBe('gi');
    expect(copy.lastIndex).toBe(3);
  });

  test('clones Maps deeply, including object keys', () => {
    const key = { id: 1 };
    const map = new Map([
      [key, { v: [1] }],
      ['k', 2],
    ]);
    const copy = deepClone(map);
    expect(copy).toBeInstanceOf(Map);
    expect(copy).not.toBe(map);
    const [[copiedKey, copiedVal], second] = [...copy.entries()];
    expect(copiedKey).toEqual({ id: 1 });
    expect(copiedKey).not.toBe(key);
    expect(copiedVal).toEqual({ v: [1] });
    expect(copiedVal).not.toBe(map.get(key));
    expect(second).toEqual(['k', 2]);
  });

  test('clones Sets deeply and keeps order', () => {
    const item = { a: 1 };
    const set = new Set([3, item, 'x']);
    const copy = deepClone(set);
    expect(copy).toBeInstanceOf(Set);
    const values = [...copy];
    expect(values[0]).toBe(3);
    expect(values[1]).toEqual({ a: 1 });
    expect(values[1]).not.toBe(item);
    expect(values[2]).toBe('x');
  });

  test('handles cycles through a Map', () => {
    const obj = { map: new Map() };
    obj.map.set('back', obj);
    const copy = deepClone(obj);
    expect(copy.map.get('back')).toBe(copy);
  });

  test('preserves prototypes of class instances', () => {
    class Point {
      constructor(x, y) {
        this.x = x;
        this.y = y;
      }
      sum() {
        return this.x + this.y;
      }
    }
    const p = new Point(1, 2);
    const copy = deepClone(p);
    expect(copy).not.toBe(p);
    expect(copy).toBeInstanceOf(Point);
    expect(copy.sum()).toBe(3);
  });

  test('copies enumerable symbol keys', () => {
    const sym = Symbol('meta');
    const src = { [sym]: { deep: true } };
    const copy = deepClone(src);
    expect(copy[sym]).toEqual({ deep: true });
    expect(copy[sym]).not.toBe(src[sym]);
  });

  test('returns functions and primitives by reference', () => {
    const fn = () => 1;
    const copy = deepClone({ fn, n: null, u: undefined, b: 5n });
    expect(copy.fn).toBe(fn);
    expect(copy.n).toBeNull();
    expect('u' in copy).toBe(true);
    expect(copy.b).toBe(5n);
  });

  test('does not mutate the input', () => {
    const src = { a: [1, 2], m: new Map([[1, 'one']]) };
    deepClone(src);
    expect(src.a).toEqual([1, 2]);
    expect(src.m.get(1)).toBe('one');
  });
});
