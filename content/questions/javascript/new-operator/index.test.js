import myNew from './index';

describe('myNew', () => {
  function Person(name, age) {
    this.name = name;
    this.age = age;
  }
  Person.prototype.greet = function () {
    return `Hi, I'm ${this.name}`;
  };

  test('runs the constructor with the new object as `this`', () => {
    const ada = myNew(Person, 'Ada', 36);
    expect(ada.name).toBe('Ada');
    expect(ada.age).toBe(36);
  });

  test('links the prototype', () => {
    const ada = myNew(Person, 'Ada');
    expect(Object.getPrototypeOf(ada)).toBe(Person.prototype);
    expect(ada.greet()).toBe("Hi, I'm Ada");
    expect(ada).toBeInstanceOf(Person);
  });

  test('creates a distinct object each time', () => {
    expect(myNew(Person, 'a')).not.toBe(myNew(Person, 'a'));
  });

  test('returns an object returned by the constructor', () => {
    const custom = { custom: true };
    function Factory() {
      this.ignored = true;
      return custom;
    }
    expect(myNew(Factory)).toBe(custom);
  });

  test('returns a function returned by the constructor', () => {
    const fn = () => 'inner';
    function Factory() {
      return fn;
    }
    expect(myNew(Factory)).toBe(fn);
  });

  test('ignores primitive and null return values', () => {
    function ReturnsNumber() {
      this.ok = true;
      return 42;
    }
    function ReturnsNull() {
      this.ok = true;
      return null;
    }
    expect(myNew(ReturnsNumber).ok).toBe(true);
    expect(myNew(ReturnsNull).ok).toBe(true);
  });

  test('falls back to Object.prototype when prototype is not an object', () => {
    function Weird() {
      this.x = 1;
    }
    Weird.prototype = null;
    const obj = myNew(Weird);
    expect(Object.getPrototypeOf(obj)).toBe(Object.prototype);
    expect(obj.x).toBe(1);
  });

  test('propagates errors thrown by the constructor', () => {
    function Broken() {
      throw new Error('ctor failed');
    }
    expect(() => myNew(Broken)).toThrow('ctor failed');
  });

  test('throws a TypeError for non-functions', () => {
    expect(() => myNew({})).toThrow(TypeError);
    expect(() => myNew(null)).toThrow(TypeError);
  });

  test('matches native new for a constructor with prototype methods', () => {
    function Counter(start) {
      this.count = start;
    }
    Counter.prototype.inc = function () {
      return ++this.count;
    };
    const mine = myNew(Counter, 5);
    const native = new Counter(5);
    expect(mine.inc()).toBe(native.inc());
    expect(Object.keys(mine)).toEqual(Object.keys(native));
  });
});
