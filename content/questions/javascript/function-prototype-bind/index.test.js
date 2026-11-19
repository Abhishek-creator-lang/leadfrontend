import myBind from './index';

describe('Function.prototype.myBind', () => {
  function greet(greeting, punctuation) {
    return `${greeting}, ${this.name}${punctuation}`;
  }

  test('is attached to Function.prototype', () => {
    expect(Function.prototype.myBind).toBe(myBind);
  });

  test('returns a function and does not call the target', () => {
    const fn = jest.fn();
    const bound = fn.myBind({});
    expect(typeof bound).toBe('function');
    expect(fn).not.toHaveBeenCalled();
  });

  test('fixes `this`', () => {
    function getName() {
      return this.name;
    }
    expect(getName.myBind({ name: 'Grace' })()).toBe('Grace');
  });

  test('prepends bound arguments to call-time arguments', () => {
    const hello = greet.myBind({ name: 'Grace' }, 'Hello');
    expect(hello('!')).toBe('Hello, Grace!');
    expect(greet.myBind({ name: 'Al' }, 'Hi', '?')()).toBe('Hi, Al?');
  });

  test('call and apply cannot override the bound `this`', () => {
    const hello = greet.myBind({ name: 'Grace' }, 'Hello');
    expect(hello.call({ name: 'Other' }, '?')).toBe('Hello, Grace?');
    expect(hello.apply({ name: 'Other' }, ['.'])).toBe('Hello, Grace.');
  });

  test('binding twice keeps the first `this` and accumulates arguments', () => {
    function collect(...args) {
      return [this.id, ...args];
    }
    const twice = collect.myBind({ id: 1 }, 'a').myBind({ id: 2 }, 'b');
    expect(twice('c')).toEqual([1, 'a', 'b', 'c']);
  });

  test('with `new`, ignores the bound `this` and constructs the target', () => {
    function Point(x, y) {
      this.x = x;
      this.y = y;
    }
    const ignored = { x: 'nope' };
    const AtOrigin = Point.myBind(ignored, 0);
    const p = new AtOrigin(5);
    expect(p.x).toBe(0);
    expect(p.y).toBe(5);
    expect(ignored.x).toBe('nope');
    expect(Object.getPrototypeOf(p)).toBe(Point.prototype);
  });

  test('instances are instanceof both the target and the bound function', () => {
    function Thing() {}
    const BoundThing = Thing.myBind(null);
    const t = new BoundThing();
    expect(t instanceof Thing).toBe(true);
    expect(t instanceof BoundThing).toBe(true);
    expect(new Thing() instanceof BoundThing).toBe(true);
  });

  test('works with class constructors under `new`', () => {
    class Box {
      constructor(value) {
        this.value = value;
      }
    }
    const BoxOf7 = Box.myBind(null, 7);
    const box = new BoxOf7();
    expect(box).toBeInstanceOf(Box);
    expect(box.value).toBe(7);
  });

  test('sets name and length', () => {
    const bound = greet.myBind(null, 'Hey');
    expect(bound.name).toBe('bound greet');
    expect(bound.length).toBe(1);
    expect(greet.myBind(null, 1, 2, 3).length).toBe(0);
  });

  test('returns the target return value', () => {
    const sum = (a, b) => a + b;
    expect(sum.myBind(null, 40)(2)).toBe(42);
  });

  test('throws a TypeError when called on a non-function', () => {
    expect(() => Function.prototype.myBind.call({}, null)).toThrow(TypeError);
  });
});
