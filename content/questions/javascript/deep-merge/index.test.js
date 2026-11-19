import deepMerge from './index';

describe('deepMerge', () => {
  test('merges flat objects, later values win', () => {
    expect(deepMerge({ a: 1, b: 2 }, { b: 3, c: 4 })).toEqual({ a: 1, b: 3, c: 4 });
  });

  test('merges nested plain objects recursively', () => {
    const base = { theme: { color: 'blue', spacing: { unit: 8, scale: 2 } } };
    const override = { theme: { spacing: { unit: 4 } } };
    expect(deepMerge(base, override)).toEqual({
      theme: { color: 'blue', spacing: { unit: 4, scale: 2 } },
    });
  });

  test('replaces arrays instead of merging them', () => {
    expect(deepMerge({ list: [1, 2, 3] }, { list: [9] })).toEqual({ list: [9] });
  });

  test('skips undefined but lets null overwrite', () => {
    expect(deepMerge({ a: 1, b: 2 }, { a: undefined, b: null })).toEqual({ a: 1, b: null });
  });

  test('replaces when types differ', () => {
    expect(deepMerge({ a: { x: 1 } }, { a: 5 })).toEqual({ a: 5 });
    expect(deepMerge({ a: 5 }, { a: { x: 1 } })).toEqual({ a: { x: 1 } });
    expect(deepMerge({ a: { x: 1 } }, { a: [1] })).toEqual({ a: [1] });
  });

  test('merges more than two objects left to right', () => {
    expect(deepMerge({ a: { x: 1 } }, { a: { y: 2 } }, { a: { x: 3 } })).toEqual({ a: { x: 3, y: 2 } });
  });

  test('does not mutate any input', () => {
    const a = { nested: { x: 1 }, list: [1] };
    const b = { nested: { y: 2 } };
    deepMerge(a, b);
    expect(a).toEqual({ nested: { x: 1 }, list: [1] });
    expect(b).toEqual({ nested: { y: 2 } });
  });

  test('result shares no plain objects or arrays with the inputs', () => {
    const a = { onlyA: { deep: { v: 1 } } };
    const b = { onlyB: { v: 2 }, list: [{ id: 1 }] };
    const out = deepMerge(a, b);
    expect(out).not.toBe(a);
    expect(out.onlyA).not.toBe(a.onlyA);
    expect(out.onlyA.deep).not.toBe(a.onlyA.deep);
    expect(out.onlyB).not.toBe(b.onlyB);
    expect(out.list).not.toBe(b.list);
    expect(out.list[0]).not.toBe(b.list[0]);
    out.onlyA.deep.v = 99;
    expect(a.onlyA.deep.v).toBe(1);
  });

  test('copies non-plain objects by reference', () => {
    const date = new Date(0);
    const fn = () => {};
    const out = deepMerge({ date: { not: 'a date' } }, { date, fn });
    expect(out.date).toBe(date);
    expect(out.fn).toBe(fn);
  });

  test('ignores null/undefined arguments and handles no arguments', () => {
    expect(deepMerge({ a: 1 }, null, undefined, { b: 2 })).toEqual({ a: 1, b: 2 });
    expect(deepMerge()).toEqual({});
  });

  test('ignores __proto__ keys from parsed JSON', () => {
    const malicious = JSON.parse('{"__proto__": {"polluted": true}, "ok": 1}');
    const out = deepMerge({}, malicious);
    expect(out.ok).toBe(1);
    expect(out.polluted).toBeUndefined();
    expect({}.polluted).toBeUndefined();
  });
});
