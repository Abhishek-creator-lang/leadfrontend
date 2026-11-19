import deepMap from './index';

const double = (v) => (typeof v === 'number' ? v * 2 : v);

describe('deepMap', () => {
  test('maps leaves of a flat object', () => {
    expect(deepMap({ a: 1, b: 2 }, double)).toEqual({ a: 2, b: 4 });
  });

  test('maps leaves of nested objects and arrays', () => {
    expect(deepMap({ a: [1, { b: 2 }], c: { d: [3] } }, double)).toEqual({
      a: [2, { b: 4 }],
      c: { d: [6] },
    });
  });

  test('preserves array-ness', () => {
    const out = deepMap([[1], [2, 3]], double);
    expect(Array.isArray(out)).toBe(true);
    expect(Array.isArray(out[1])).toBe(true);
    expect(out).toEqual([[2], [4, 6]]);
  });

  test('passes the path with numeric indexes', () => {
    const out = deepMap({ a: [1, { b: 2 }] }, (v, path) => path);
    expect(out).toEqual({ a: [['a', 0], { b: ['a', 1, 'b'] }] });
  });

  test('root leaf gets an empty path', () => {
    const fn = jest.fn((v) => v + 1);
    expect(deepMap(5, fn)).toBe(6);
    expect(fn).toHaveBeenCalledWith(5, []);
  });

  test('calls fn once per leaf, including null and undefined', () => {
    const fn = jest.fn((v) => v);
    deepMap({ a: null, b: undefined, c: [0, ''] }, fn);
    expect(fn).toHaveBeenCalledTimes(4);
  });

  test('keeps empty containers and does not call fn for them', () => {
    const fn = jest.fn((v) => v);
    expect(deepMap({ a: {}, b: [] }, fn)).toEqual({ a: {}, b: [] });
    expect(fn).not.toHaveBeenCalled();
  });

  test('treats Dates, Maps and class instances as leaves', () => {
    const date = new Date(0);
    const map = new Map();
    const seen = [];
    deepMap({ date, map }, (v) => {
      seen.push(v);
      return v;
    });
    expect(seen[0]).toBe(date);
    expect(seen[1]).toBe(map);
  });

  test('does not mutate the input and returns new containers', () => {
    const input = { a: { b: 1 }, list: [1] };
    const out = deepMap(input, double);
    expect(input).toEqual({ a: { b: 1 }, list: [1] });
    expect(out.a).not.toBe(input.a);
    expect(out.list).not.toBe(input.list);
  });

  test('can change the leaf type', () => {
    expect(deepMap({ a: ' x ', b: [' y'] }, (v) => v.trim().toUpperCase())).toEqual({ a: 'X', b: ['Y'] });
  });
});
