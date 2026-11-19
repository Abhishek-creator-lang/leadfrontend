import isEmpty from './index';

describe('isEmpty', () => {
  test('null and undefined are empty', () => {
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
  });

  test('strings use length', () => {
    expect(isEmpty('')).toBe(true);
    expect(isEmpty(' ')).toBe(false);
    expect(isEmpty('abc')).toBe(false);
  });

  test('arrays use length', () => {
    expect(isEmpty([])).toBe(true);
    expect(isEmpty([undefined])).toBe(false);
    expect(isEmpty([1, 2])).toBe(false);
  });

  test('arguments and typed arrays use length', () => {
    const emptyArgs = (function () {
      return arguments;
    })();
    const someArgs = (function () {
      return arguments;
    })(1);
    expect(isEmpty(emptyArgs)).toBe(true);
    expect(isEmpty(someArgs)).toBe(false);
    expect(isEmpty(new Uint8Array(0))).toBe(true);
    expect(isEmpty(new Uint8Array(2))).toBe(false);
  });

  test('Map and Set use size', () => {
    expect(isEmpty(new Map())).toBe(true);
    expect(isEmpty(new Map([['a', 1]]))).toBe(false);
    expect(isEmpty(new Set())).toBe(true);
    expect(isEmpty(new Set([1]))).toBe(false);
  });

  test('plain objects use own enumerable keys', () => {
    expect(isEmpty({})).toBe(true);
    expect(isEmpty({ a: 1 })).toBe(false);
    expect(isEmpty({ a: undefined })).toBe(false);
  });

  test('inherited, non-enumerable and symbol keys do not count', () => {
    expect(isEmpty(Object.create({ inherited: 1 }))).toBe(true);
    const hidden = {};
    Object.defineProperty(hidden, 'x', { value: 1, enumerable: false });
    expect(isEmpty(hidden)).toBe(true);
    expect(isEmpty({ [Symbol('s')]: 1 })).toBe(true);
  });

  test('null-prototype objects work', () => {
    const bare = Object.create(null);
    expect(isEmpty(bare)).toBe(true);
    bare.key = 'v';
    expect(isEmpty(bare)).toBe(false);
  });

  test('class instances use own keys', () => {
    class Empty {}
    class WithField {
      constructor() {
        this.x = 1;
      }
    }
    expect(isEmpty(new Empty())).toBe(true);
    expect(isEmpty(new WithField())).toBe(false);
  });

  test('other primitives are always empty', () => {
    expect(isEmpty(0)).toBe(true);
    expect(isEmpty(42)).toBe(true);
    expect(isEmpty(true)).toBe(true);
    expect(isEmpty(false)).toBe(true);
    expect(isEmpty(Symbol('x'))).toBe(true);
    expect(isEmpty(10n)).toBe(true);
  });

  test('dates and functions without own keys are empty', () => {
    expect(isEmpty(new Date())).toBe(true);
    expect(isEmpty(function () {})).toBe(true);
  });
});
