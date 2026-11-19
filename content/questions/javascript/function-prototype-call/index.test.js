import myCall from './index';

describe('Function.prototype.myCall', () => {
  function introduce(greeting, punctuation) {
    return `${greeting}, ${this.name}${punctuation}`;
  }

  test('is attached to Function.prototype', () => {
    expect(Function.prototype.myCall).toBe(myCall);
  });

  test('sets `this` and passes arguments individually', () => {
    expect(introduce.myCall({ name: 'Ada' }, 'Hello', '!')).toBe('Hello, Ada!');
  });

  test('returns the function result', () => {
    const add = (a, b) => a + b;
    expect(add.myCall(null, 2, 3)).toBe(5);
  });

  test('works with no extra arguments', () => {
    function getName() {
      return this.name;
    }
    expect(getName.myCall({ name: 'Lin' })).toBe('Lin');
  });

  test('boxes primitive thisArg values', () => {
    function oneDecimal() {
      return this.toFixed(1);
    }
    expect(oneDecimal.myCall(2)).toBe('2.0');
    function upper() {
      return this.toUpperCase();
    }
    expect(upper.myCall('abc')).toBe('ABC');
  });

  test('the function can read other properties of thisArg', () => {
    const counter = { count: 1 };
    function increment(by) {
      this.count += by;
      return this.count;
    }
    expect(increment.myCall(counter, 4)).toBe(5);
    expect(counter.count).toBe(5);
  });

  test('does not clobber existing properties and leaves no trace', () => {
    const target = { fn: 'keep me', name: 'T' };
    const keysBefore = Reflect.ownKeys(target);
    function getName() {
      return this.name;
    }
    expect(getName.myCall(target)).toBe('T');
    expect(target.fn).toBe('keep me');
    expect(Reflect.ownKeys(target)).toEqual(keysBefore);
  });

  test('cleans up and rethrows when the function throws', () => {
    const target = {};
    function fail() {
      throw new Error('boom');
    }
    expect(() => fail.myCall(target)).toThrow('boom');
    expect(Reflect.ownKeys(target)).toEqual([]);
  });

  test('throws a TypeError when not called on a function', () => {
    expect(() => Function.prototype.myCall.call({}, null)).toThrow(TypeError);
  });

  test('can call a function with itself as thisArg', () => {
    function self() {
      return this;
    }
    expect(self.myCall(self)).toBe(self);
  });
});
