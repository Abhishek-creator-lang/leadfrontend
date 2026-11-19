## TL;DR

The **Prototype pattern** creates new objects **by copying or deriving from an existing object (the prototype)** instead of instantiating a class from scratch. In JavaScript the pattern is built into the language: every object has a `[[Prototype]]` link, and **`Object.create(proto)`** makes a new object that **delegates** to `proto` for missing properties. Related techniques are **cloning** a configured object (`structuredClone`, spread) and **sharing methods** on a constructor's/class's prototype so all instances reuse one copy.

## Delegation with `Object.create`

```js
const vehicle = {
  wheels: 4,
  describe() {
    return `${this.name} has ${this.wheels} wheels`;
  },
};

const car = Object.create(vehicle);
car.name = 'Sedan';
car.describe();       // 'Sedan has 4 wheels' (method found on the prototype)

const bike = Object.create(vehicle, {
  name: { value: 'Bike', enumerable: true },
  wheels: { value: 2, enumerable: true },
});
bike.describe();      // 'Bike has 2 wheels' (own property shadows the prototype's)

Object.getPrototypeOf(car) === vehicle; // true
```

Properties aren't copied; lookups walk the prototype chain. Changing `vehicle.describe` later affects every object derived from it.

## Shared methods: how classes use it

```js
class Point {
  constructor(x, y) { this.x = x; this.y = y; }
  length() { return Math.hypot(this.x, this.y); }
}
const p1 = new Point(3, 4);
const p2 = new Point(1, 1);
p1.length === p2.length;                 // true: one function on Point.prototype
Object.hasOwn(p1, 'length');             // false
```

`class` is syntax over the same mechanism, so a million instances share one `length` function.

## Cloning: the GoF flavour

The classic pattern describes objects that know how to clone themselves, useful when constructing from scratch is expensive or the configuration is complex:

```js
const baseRequest = {
  method: 'GET',
  headers: { Accept: 'application/json', 'X-Client': 'web' },
  retry: { attempts: 3, backoffMs: 200 },
};

// shallow copy: nested objects are shared!
const shallow = { ...baseRequest, method: 'POST' };
shallow.headers === baseRequest.headers; // true

// deep copy
const deep = structuredClone(baseRequest);
deep.headers['X-Trace'] = 'abc';         // original untouched
```

`structuredClone` handles nested objects, `Map`, `Set`, `Date`, typed arrays and cycles, but not functions, DOM nodes or class prototypes (instances come back as plain objects). Classes can implement their own `clone()` to preserve type:

```js
class Shape {
  constructor(opts) { Object.assign(this, opts); }
  clone() { return new this.constructor(structuredClone({ ...this })); }
}
```

## When it's useful

- Many objects that share behaviour but differ in a few properties (prototype delegation saves memory).
- Creating variations from a pre-configured template (request configs, default settings, game entities, editor shapes on copy/paste).
- Creating objects without a constructor: `Object.create(null)` gives a dictionary with **no** inherited properties (no `toString`, no `__proto__` pitfalls).

## Pitfalls

- **Shared mutable state on the prototype**: putting an array or object on the prototype means all instances mutate the same one.

```js
const proto = { tags: [] };
const a = Object.create(proto), b = Object.create(proto);
a.tags.push('x');
b.tags; // ['x'] (surprise)
```

- **Shallow vs deep copies** when cloning.
- **Modifying built-in prototypes** (`Array.prototype.myFn`) affects all code on the page; avoid it.
- **Performance**: changing an object's prototype after creation (`Object.setPrototypeOf`) is slow in engines; set it at creation instead.
- **Prototype pollution**: merging untrusted JSON with keys like `__proto__` can modify `Object.prototype`. Use `Object.create(null)`, `Map`, or safe merge utilities.

## In an interview, mention…

- JS is prototype-based: `Object.create` and delegation are the pattern in native form.
- Classes share methods via the prototype; cloning via spread vs `structuredClone`.
- Shared-mutable-state and prototype-pollution pitfalls.
