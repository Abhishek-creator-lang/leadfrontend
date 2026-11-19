import objectCreate from './index';

describe('objectCreate', () => {
  const animal = {
    speak() {
      return `${this.name} makes a sound`;
    },
  };

  test('creates an object with the given prototype', () => {
    const dog = objectCreate(animal);
    expect(Object.getPrototypeOf(dog)).toBe(animal);
  });

  test('the new object is empty but inherits behaviour', () => {
    const dog = objectCreate(animal);
    expect(Object.keys(dog)).toEqual([]);
    dog.name = 'Rex';
    expect(dog.speak()).toBe('Rex makes a sound');
  });

  test('supports a null prototype', () => {
    const dict = objectCreate(null);
    expect(Object.getPrototypeOf(dict)).toBeNull();
    expect('toString' in dict).toBe(false);
  });

  test('accepts a function as the prototype', () => {
    function base() {}
    const obj = objectCreate(base);
    expect(Object.getPrototypeOf(obj)).toBe(base);
    expect(typeof obj.call).toBe('function');
  });

  test('defines properties from descriptors', () => {
    const point = objectCreate(Object.prototype, {
      x: { value: 1, enumerable: true, writable: true },
      y: { value: 2 },
    });
    expect(point.x).toBe(1);
    expect(point.y).toBe(2);
    expect(Object.keys(point)).toEqual(['x']);
    const yDescriptor = Object.getOwnPropertyDescriptor(point, 'y');
    expect(yDescriptor.writable).toBe(false);
    expect(yDescriptor.enumerable).toBe(false);
    expect(yDescriptor.configurable).toBe(false);
  });

  test('supports accessor descriptors', () => {
    const obj = objectCreate(null, {
      double: {
        get() {
          return this.n * 2;
        },
      },
      n: { value: 21 },
    });
    expect(obj.double).toBe(42);
  });

  test('works with constructor-style inheritance', () => {
    function Parent() {}
    Parent.prototype.greet = () => 'hi';
    function Child() {}
    Child.prototype = objectCreate(Parent.prototype);
    expect(new Child().greet()).toBe('hi');
    expect(new Child()).toBeInstanceOf(Parent);
  });

  test('throws a TypeError for an invalid prototype', () => {
    expect(() => objectCreate(undefined)).toThrow(TypeError);
    expect(() => objectCreate(42)).toThrow(TypeError);
    expect(() => objectCreate('proto')).toThrow(TypeError);
  });

  test('throws a TypeError when propertiesObject is null', () => {
    expect(() => objectCreate({}, null)).toThrow(TypeError);
  });

  test('each call creates a distinct object', () => {
    expect(objectCreate(animal)).not.toBe(objectCreate(animal));
  });
});
