import isPrimitive, {
  isBoolean,
  isNumber,
  isString,
  isSymbol,
  isBigInt,
  isNull,
  isUndefined,
  isNil,
} from './index';

describe('type utilities', () => {
  test('isBoolean', () => {
    expect(isBoolean(true)).toBe(true);
    expect(isBoolean(false)).toBe(true);
    expect(isBoolean(0)).toBe(false);
    expect(isBoolean('true')).toBe(false);
    expect(isBoolean(new Boolean(false))).toBe(false);
  });

  test('isNumber includes NaN and Infinity', () => {
    expect(isNumber(0)).toBe(true);
    expect(isNumber(-1.5)).toBe(true);
    expect(isNumber(NaN)).toBe(true);
    expect(isNumber(Infinity)).toBe(true);
    expect(isNumber('42')).toBe(false);
    expect(isNumber(10n)).toBe(false);
    expect(isNumber(new Number(1))).toBe(false);
  });

  test('isString', () => {
    expect(isString('')).toBe(true);
    expect(isString('abc')).toBe(true);
    expect(isString(new String('abc'))).toBe(false);
    expect(isString(['a'])).toBe(false);
  });

  test('isSymbol', () => {
    expect(isSymbol(Symbol('x'))).toBe(true);
    expect(isSymbol(Symbol.iterator)).toBe(true);
    expect(isSymbol(Object(Symbol('x')))).toBe(false);
    expect(isSymbol('Symbol(x)')).toBe(false);
  });

  test('isBigInt', () => {
    expect(isBigInt(10n)).toBe(true);
    expect(isBigInt(BigInt(5))).toBe(true);
    expect(isBigInt(10)).toBe(false);
  });

  test('isNull', () => {
    expect(isNull(null)).toBe(true);
    expect(isNull(undefined)).toBe(false);
    expect(isNull({})).toBe(false);
    expect(isNull(0)).toBe(false);
  });

  test('isUndefined', () => {
    expect(isUndefined(undefined)).toBe(true);
    expect(isUndefined(void 0)).toBe(true);
    expect(isUndefined(null)).toBe(false);
    expect(isUndefined('')).toBe(false);
  });

  test('isNil matches only null and undefined', () => {
    expect(isNil(null)).toBe(true);
    expect(isNil(undefined)).toBe(true);
    expect(isNil(0)).toBe(false);
    expect(isNil('')).toBe(false);
    expect(isNil(false)).toBe(false);
    expect(isNil(NaN)).toBe(false);
  });

  test('isPrimitive accepts all seven primitive types', () => {
    for (const v of ['s', 1, NaN, 1n, true, Symbol('s'), undefined, null]) {
      expect(isPrimitive(v)).toBe(true);
    }
  });

  test('isPrimitive rejects objects, arrays, functions and boxed values', () => {
    for (const v of [{}, [], () => {}, new Date(), /re/, new Number(1), new String('s'), Object(1n)]) {
      expect(isPrimitive(v)).toBe(false);
    }
  });
});
