import numberOfArguments from './index';

describe('numberOfArguments', () => {
  test('no arguments', () => {
    expect(numberOfArguments()).toBe(0);
  });

  test('one argument', () => {
    expect(numberOfArguments('a')).toBe(1);
  });

  test('several arguments of mixed types', () => {
    expect(numberOfArguments(1, 'two', { three: 3 }, [4], () => 5)).toBe(5);
  });

  test('explicit undefined and null count', () => {
    expect(numberOfArguments(undefined)).toBe(1);
    expect(numberOfArguments(null, undefined)).toBe(2);
  });

  test('spread of a sparse array counts the holes', () => {
    // eslint-disable-next-line no-sparse-arrays
    expect(numberOfArguments(...[1, , 3])).toBe(3);
  });

  test('works with call and apply', () => {
    expect(numberOfArguments.call(null, 'a', 'b')).toBe(2);
    expect(numberOfArguments.apply(null, [1, 2, 3, 4])).toBe(4);
    expect(numberOfArguments.apply(null, { length: 2 })).toBe(2);
  });

  test('many arguments', () => {
    const many = Array.from({ length: 1000 }, (_, i) => i);
    expect(numberOfArguments(...many)).toBe(1000);
  });

  test('declares no parameters', () => {
    expect(numberOfArguments.length).toBe(0);
  });
});
