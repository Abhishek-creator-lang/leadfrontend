import classNames from './index';

describe('classNames', () => {
  test('no arguments returns an empty string', () => {
    expect(classNames()).toBe('');
  });

  test('joins strings with single spaces', () => {
    expect(classNames('a')).toBe('a');
    expect(classNames('a', 'b', 'c')).toBe('a b c');
  });

  test('includes object keys with truthy values only', () => {
    expect(classNames({ a: true, b: false, c: 1, d: 0, e: 'yes', f: '', g: null })).toBe('a c e');
  });

  test('mixes strings and objects in order', () => {
    expect(classNames('btn', { active: true, disabled: false }, 'large')).toBe('btn active large');
  });

  test('flattens nested arrays recursively', () => {
    expect(classNames('a', ['b', ['c', ['d', { e: true, f: false }]]])).toBe('a b c d e');
    expect(classNames([], [[]], 'x')).toBe('x');
  });

  test('ignores falsy values and booleans', () => {
    expect(classNames(null, undefined, false, true, '', 0, NaN)).toBe('');
    expect(classNames('a', null, false, 'b')).toBe('a b');
  });

  test('includes non-zero numbers', () => {
    expect(classNames(1, 'x', -2, 0)).toBe('1 x -2');
  });

  test('ignores functions and symbols', () => {
    expect(classNames('a', () => 'b', Symbol('c'))).toBe('a');
  });

  test('keeps duplicates', () => {
    expect(classNames('a', 'a', { a: true })).toBe('a a a');
  });

  test('ignores inherited keys', () => {
    const proto = { inherited: true };
    const obj = Object.create(proto);
    obj.own = true;
    expect(classNames(obj)).toBe('own');
  });

  test('never produces extra whitespace', () => {
    const result = classNames('', 'a', [], { b: false }, ['', 'c'], null);
    expect(result).toBe('a c');
  });
});
