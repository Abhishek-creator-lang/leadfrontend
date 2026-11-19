import myInstanceOf from './index';

describe('myInstanceOf', () => {
  class Animal {}
  class Dog extends Animal {}
  const rex = new Dog();

  test('matches the direct constructor', () => {
    expect(myInstanceOf(rex, Dog)).toBe(true);
  });

  test('walks up the prototype chain', () => {
    expect(myInstanceOf(rex, Animal)).toBe(true);
    expect(myInstanceOf(rex, Object)).toBe(true);
    expect(myInstanceOf([], Object)).toBe(true);
    expect(myInstanceOf(() => {}, Function)).toBe(true);
  });

  test('returns false for unrelated constructors', () => {
    expect(myInstanceOf(rex, Array)).toBe(false);
    expect(myInstanceOf(new Animal(), Dog)).toBe(false);
  });

  test('returns false for primitives', () => {
    expect(myInstanceOf(42, Number)).toBe(false);
    expect(myInstanceOf('str', String)).toBe(false);
    expect(myInstanceOf(null, Object)).toBe(false);
    expect(myInstanceOf(undefined, Object)).toBe(false);
  });

  test('returns true for boxed primitives', () => {
    // eslint-disable-next-line no-new-wrappers
    expect(myInstanceOf(new Number(42), Number)).toBe(true);
  });

  test('a prototype object is not an instance of its own constructor', () => {
    expect(myInstanceOf(Dog.prototype, Dog)).toBe(false);
    expect(myInstanceOf(Dog.prototype, Animal)).toBe(true);
  });

  test('handles null-prototype objects', () => {
    expect(myInstanceOf(Object.create(null), Object)).toBe(false);
  });

  test('reflects prototype changes made after creation', () => {
    function A() {}
    function B() {}
    const obj = new A();
    Object.setPrototypeOf(obj, B.prototype);
    expect(myInstanceOf(obj, A)).toBe(false);
    expect(myInstanceOf(obj, B)).toBe(true);
  });

  test('honours a custom Symbol.hasInstance', () => {
    class Even {
      static [Symbol.hasInstance](n) {
        return n % 2 === 0;
      }
    }
    expect(myInstanceOf(4, Even)).toBe(true);
    expect(myInstanceOf(3, Even)).toBe(false);

    const objectChecker = { [Symbol.hasInstance]: (v) => Array.isArray(v) };
    expect(myInstanceOf([], objectChecker)).toBe(true);
  });

  test('throws a TypeError for a non-object or non-callable target', () => {
    expect(() => myInstanceOf(rex, {})).toThrow(TypeError);
    expect(() => myInstanceOf(rex, 42)).toThrow(TypeError);
    expect(() => myInstanceOf(rex, null)).toThrow(TypeError);
  });

  test('throws a TypeError when the target prototype is not an object', () => {
    const arrow = () => {};
    expect(() => myInstanceOf({}, arrow)).toThrow(TypeError);
  });
});
