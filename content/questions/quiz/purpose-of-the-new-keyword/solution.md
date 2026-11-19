## TL;DR

`new F(...args)` **creates a new object whose prototype is `F.prototype`**, **runs `F` with `this` bound to that object**, and **returns the object**, unless `F` explicitly returns a different *object*. It's how constructor functions and classes produce instances that share methods through their prototype.

## The four steps

```js
function User(name) {
  this.name = name;
}
User.prototype.greet = function () { return `Hi, ${this.name}`; };

const u = new User('Ada');
```

1. Create a fresh object: `{}`.
2. Set its `[[Prototype]]` to `User.prototype`.
3. Call `User` with `this` = that object and the given arguments.
4. If `User` returns an **object** (including arrays/functions), use it; otherwise return the new object.

A rough equivalent:

```js
function myNew(F, ...args) {
  const obj = Object.create(F.prototype);
  const result = F.apply(obj, args);
  return result !== null && (typeof result === 'object' || typeof result === 'function') ? result : obj;
}
```

(Real `new` with classes differs: derived classes create `this` in the base constructor via `super()`, and class constructors cannot be called via `apply`.)

## Return-value rules

```js
function A() { this.x = 1; return { y: 2 }; }
new A(); // { y: 2 }: returned object wins

function B() { this.x = 1; return 42; }
new B(); // { x: 1 }: primitive return values are ignored
```

## What happens without `new`

```js
function Point(x) { this.x = x; }
const p = Point(1);
// sloppy mode: this === globalThis → creates a global `x`, p is undefined
// strict mode: this === undefined → TypeError
```

Classes protect you: `class P {}; P()` throws `TypeError: Class constructor P cannot be invoked without 'new'`. In plain functions you can detect it with **`new.target`**:

```js
function Point(x) {
  if (!new.target) return new Point(x);
  this.x = x;
}
```

`new.target` is also how abstract base classes refuse direct instantiation:

```js
class Shape {
  constructor() {
    if (new.target === Shape) throw new TypeError('Shape is abstract');
  }
}
```

## What can and can't be constructed

- ✅ Regular `function` declarations/expressions, classes, most built-ins (`new Map()`, `new Date()`, `new Promise()`).
- ❌ Arrow functions, methods defined with shorthand syntax, `async` functions and generators throw `TypeError: … is not a constructor`.
- ⚠️ `Symbol` and `BigInt` must **not** be called with `new`. `String`, `Number` and `Boolean` *can* be, but create wrapper objects (`new Boolean(false)` is truthy), so call them without `new` for conversion.
- `Date()` without `new` returns a string, while `new Date()` returns a `Date` object. Some built-ins behave differently with and without `new`.

## Pitfalls

- Forgetting `new` with constructor functions (mitigated by classes, linting and `new.target` guards).
- Returning an object from a constructor by accident discards the instance and its prototype methods.
- Using `new` for factory functions that already return objects works but wastes an allocation and confuses readers.

## In an interview, mention…

- The four steps, especially the prototype link (which is what makes shared methods work).
- Return-value override rules and `new.target`.
- Which callables are constructible, and why classes are safer than constructor functions.
