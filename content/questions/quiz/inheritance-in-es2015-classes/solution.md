## TL;DR

A subclass is declared with **`class Child extends Parent`**. **`super(...)`** must be called in the child's constructor **before using `this`**, and **`super.method()`** calls the parent's version of an overridden method. Under the hood, `extends` links **two prototype chains**: `Child.prototype → Parent.prototype` (for instance methods) and `Child → Parent` (so **static members are inherited too**). You can also extend built-ins like `Error`, `Array` and `HTMLElement`.

## Example

```js
class Shape {
  static count = 0;
  #id;
  constructor(name) {
    this.name = name;
    this.#id = ++Shape.count;
  }
  area() { return 0; }
  describe() { return `${this.name} #${this.#id} with area ${this.area().toFixed(2)}`; }
  static create(...args) { return new this(...args); } // `this` is the class it's called on
}

class Circle extends Shape {
  constructor(r) {
    super('circle');   // runs Shape's constructor and creates `this`
    this.r = r;        // only valid after super()
  }
  area() { return Math.PI * this.r ** 2; } // override
  describe() { return `${super.describe()} (r=${this.r})`; } // extend parent behaviour
}

const c = Circle.create(2);   // static method inherited; returns a Circle
c.describe();                 // 'circle #1 with area 12.57 (r=2)'
c instanceof Shape;           // true
```

## Rules to know

- **Derived constructors must call `super()`** before touching `this` and before returning. Otherwise you get a `ReferenceError`. If you omit the constructor entirely, a default one forwards all arguments: `constructor(...args) { super(...args); }`.
- **Field initialisers run right after `super()` returns**, in the subclass. Parent constructors therefore can't see subclass fields:

```js
class Base {
  constructor() { this.init(); }
  init() {}
}
class Child extends Base {
  items = [];
  init() { this.items.push(1); } // TypeError: items is undefined during Base's constructor
}
```

Avoid calling overridable methods from constructors.

- **Private fields (`#x`) are not inherited** in the sense of access: a subclass cannot read `this.#id` declared in `Shape`. Expose a getter or a protected-by-convention `_id` if subclasses need it.
- **`super` works in object literals too**, in concise methods, and it's bound lexically to the method's "home object".
- **`extends` accepts any expression** that evaluates to a constructor (or `null`), which enables **mix-ins**:

```js
const Serializable = (Base) => class extends Base {
  toJSON() { return { ...this, type: this.constructor.name }; }
};
class Point extends Serializable(Object) { constructor(x, y) { super(); this.x = x; this.y = y; } }
```

## Extending built-ins

```js
class HttpError extends Error {
  constructor(status, message, options) {
    super(message, options); // supports { cause }
    this.name = 'HttpError';
    this.status = status;
  }
}
```

With native classes, `instanceof HttpError` works properly. Old Babel output targeting ES5 couldn't subclass `Error`/`Array` correctly. Custom elements also rely on this: `class MyEl extends HTMLElement`.

## How it maps to prototypes

```js
Object.getPrototypeOf(Circle.prototype) === Shape.prototype; // true: instance methods
Object.getPrototypeOf(Circle) === Shape;                     // true: static members
```

## Pitfalls

- **Deep hierarchies** become fragile ("fragile base class" problem). Prefer composition and keep inheritance to one or two levels.
- **Arrow-function class fields** used as methods are per-instance properties, not prototype methods, so subclasses can't call them with `super.method()`.
- Overriding a method and forgetting to call `super.method()` when the parent does necessary work (lifecycle hooks in Web Components or Lit).

## In an interview, mention…

- `extends`, `super()` before `this`, `super.method()`, inherited statics.
- Initialisation order (parent constructor → subclass fields → rest of subclass constructor) and the danger of virtual calls in constructors.
- Private fields aren't accessible to subclasses; mix-ins and composition as alternatives to deep trees.
