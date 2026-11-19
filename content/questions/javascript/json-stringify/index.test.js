import jsonStringify from './index';

const same = (value) => expect(jsonStringify(value)).toBe(JSON.stringify(value));

describe('jsonStringify', () => {
  test('primitives', () => {
    [null, true, false, 0, 42, -3.5, 1e21, 1e-7, -0, 'hello', ''].forEach(same);
  });

  test('non-finite numbers become null', () => {
    [NaN, Infinity, -Infinity].forEach(same);
    same([NaN, Infinity]);
    same({ x: -Infinity });
  });

  test('top-level undefined, functions and symbols return undefined', () => {
    expect(jsonStringify(undefined)).toBeUndefined();
    expect(jsonStringify(() => {})).toBeUndefined();
    expect(jsonStringify(Symbol('s'))).toBeUndefined();
  });

  test('arrays, including unsupported values and holes', () => {
    same([]);
    same([1, 'a', true, null]);
    same([undefined, function () {}, Symbol('x')]);
    // eslint-disable-next-line no-sparse-arrays
    same([1, , 3]);
  });

  test('objects skip unsupported values and symbol keys', () => {
    same({});
    same({ a: 1, b: 'two', c: null, d: false });
    same({ a: undefined, b: () => {}, c: Symbol('x'), d: 1 });
    same({ [Symbol('k')]: 1, e: 2 });
  });

  test('preserves key order, including integer-like keys', () => {
    same({ b: 1, a: 2, 10: 'ten', 2: 'two' });
  });

  test('nested structures', () => {
    same({ user: { name: 'Ada', tags: ['x', { deep: [1, [2, [3]]] }] }, list: [[], {}] });
  });

  test('escapes quotes, backslashes and control characters', () => {
    same('He said "hi" \\ bye');
    same('\b\f\n\r\t');
    same('\u0000\u0001\u001f\u000b');
    same({ 'key"with\nnewline': 'v' });
  });

  test('keeps valid surrogate pairs and escapes lone surrogates', () => {
    same('emoji 😀 ok');
    same('lone high \ud800 x');
    same('lone low \udc00 x');
    same('\udbff');
    same('\udc00\ud800');
  });

  test('calls toJSON with the right key', () => {
    same(new Date(0));
    same({ when: new Date(Date.UTC(2020, 1, 29)) });
    const keys = [];
    const spy = { toJSON: (k) => (keys.push(k), `key:${k}`) };
    expect(jsonStringify({ a: spy, list: [spy] })).toBe(JSON.stringify({ a: spy, list: [spy] }));
    expect(keys).toEqual(['a', '0', 'a', '0']);
    expect(jsonStringify(spy)).toBe('"key:"');
  });

  test('toJSON returning undefined removes the property', () => {
    same({ a: { toJSON: () => undefined }, b: 1 });
  });

  test('unwraps primitive wrapper objects', () => {
    same([new Number(3), new String('s'), new Boolean(false)]);
  });

  test('Map, Set and class instances use own enumerable keys', () => {
    class Point {
      constructor() {
        this.x = 1;
        this.y = 2;
      }
      get sum() {
        return this.x + this.y;
      }
    }
    same({ m: new Map([[1, 2]]), s: new Set([1]), p: new Point() });
  });

  test('allows shared (non-circular) references', () => {
    const shared = { v: 1 };
    same({ a: shared, b: shared, c: [shared, shared] });
  });

  test('throws TypeError on circular references', () => {
    const obj = { name: 'loop' };
    obj.self = obj;
    expect(() => jsonStringify(obj)).toThrow(TypeError);
    const arr = [1];
    arr.push({ back: arr });
    expect(() => jsonStringify(arr)).toThrow(TypeError);
  });

  test('throws TypeError for BigInt', () => {
    expect(() => jsonStringify(10n)).toThrow(TypeError);
    expect(() => jsonStringify({ big: 1n })).toThrow(TypeError);
  });
});
