## TL;DR

The everyday choices are **object literals** (`{}`), **classes / constructor functions with `new`**, **`Object.create(proto)`** and **factory functions** that return literals. They differ mainly in **how the prototype is set up** and whether you need shared methods, private state or a null prototype. Copies can also be made with spread, `Object.assign` or `structuredClone`.

## The options

```js
// 1. Object literal: prototype is Object.prototype
const point = { x: 1, y: 2, toString() { return `${this.x},${this.y}`; } };

// 2. Constructor function + new (pre-ES2015 style)
function Point(x, y) { this.x = x; this.y = y; }
Point.prototype.len = function () { return Math.hypot(this.x, this.y); };
const p1 = new Point(3, 4);

// 3. Class (same prototype mechanics, nicer syntax, real privacy)
class Vec {
  #id = crypto.randomUUID();
  constructor(x, y) { this.x = x; this.y = y; }
  len() { return Math.hypot(this.x, this.y); }
}
const v = new Vec(3, 4);

// 4. Object.create: choose the prototype explicitly
const proto = { greet() { return `hi ${this.name}`; } };
const user = Object.create(proto, { name: { value: 'Ada', enumerable: true } });
const dict = Object.create(null); // no prototype: safe key-value bag

// 5. Factory function: closures instead of this/new
function createCounter(start = 0) {
  let n = start; // private by closure
  return { inc: () => ++n, get value() { return n; } };
}

// 6. From entries / copies
const fromPairs = Object.fromEntries([['a', 1], ['b', 2]]);
const shallow = { ...point, x: 10 };
const deep = structuredClone({ nested: { date: new Date() } });
```

## Choosing between them

| Approach | Shared methods | Private state | Notes |
|---|---|---|---|
| Literal | No (each literal is its own) | No | Best for plain data, config, DTOs |
| Class / constructor | Yes, via `prototype` | `#fields` (class only) | Works with `instanceof`, good for many instances |
| `Object.create` | Yes, any prototype | No | Explicit delegation; `Object.create(null)` for dictionaries |
| Factory | No (functions per instance) | Yes, via closure | No `this`/`new` pitfalls; slightly more memory per instance |

## Pitfalls

- **Forgetting `new`** with a constructor function sets properties on `undefined` (strict mode throws) or on the global object (sloppy mode). Classes throw a `TypeError` if called without `new`.
- **Spread and `Object.assign` are shallow** and copy only own enumerable properties. Getters are invoked and the *values* are copied, and the prototype is lost.
- **`structuredClone`** handles cycles, `Date`, `Map`, `Set` and typed arrays, but throws on functions and DOM nodes and drops the prototype, so class instances come back as plain objects.
- `new Object()` works but is never preferred over `{}`.
- A literal with a key like `__proto__: x` *sets the prototype* rather than creating an own property. Use `Object.create(null)` or a `Map` when keys come from users.

## In an interview, mention…

- All of these end up as the same thing: an object with own properties and a `[[Prototype]]` link. The difference is **who sets that link and where the methods live**.
- Pick literals for data, classes when you have many instances with behaviour (and want `#private`), factories when you want closures and composition, and `Object.create(null)` or `Map` for dictionaries.
- Copying (`structuredClone` vs spread) is a separate concern from construction, and its shallow/deep nuances matter for immutable state updates.
