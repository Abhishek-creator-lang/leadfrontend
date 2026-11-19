## TL;DR

A constructor function is an **ordinary `function` called with `new`**. By convention it's **named in PascalCase**, it **assigns per-instance data to `this`**, and **shared methods go on `ConstructorName.prototype`** so every instance reuses one copy. In modern code, a **`class`** does the same thing with safer syntax, but understanding the function form explains how classes work.

## The pattern

```js
function Timer(label) {
  // per-instance state
  this.label = label;
  this.startedAt = null;
}

// shared behaviour: defined once, used by all instances
Timer.prototype.start = function () {
  this.startedAt = performance.now();
  return this;
};
Timer.prototype.elapsed = function () {
  return this.startedAt == null ? 0 : performance.now() - this.startedAt;
};

// "static" helper
Timer.fromNow = function (label) { return new Timer(label).start(); };

const t = new Timer('render').start();
t.elapsed();              // e.g. 12.3
t instanceof Timer;       // true
t.constructor === Timer;  // true (inherited from Timer.prototype)
```

## Why methods go on the prototype

```js
function Bad(label) {
  this.label = label;
  this.start = function () { /* … */ }; // a new function per instance
}
```

This works, but each instance gets its own function object: more memory, and you can't patch or inspect the method in one place. The one advantage is that such functions can close over private variables in the constructor:

```js
function Counter() {
  let count = 0;                       // truly private
  this.increment = () => ++count;      // privileged method
}
```

## Guarding against a missing `new`

```js
function Timer(label) {
  if (!new.target) return new Timer(label); // or throw a TypeError
  this.label = label;
}
```

Without this, calling `Timer('x')` in sloppy mode writes `label` onto the global object; in strict mode it throws because `this` is `undefined`.

## Inheritance with constructor functions (legacy pattern)

```js
function Stopwatch(label) {
  Timer.call(this, label);        // "super" call
  this.laps = [];
}
Stopwatch.prototype = Object.create(Timer.prototype);
Stopwatch.prototype.constructor = Stopwatch; // restore the constructor link
Stopwatch.prototype.lap = function () { this.laps.push(this.elapsed()); };
```

## The modern equivalent

```js
class Timer {
  startedAt = null;
  constructor(label) { this.label = label; }
  start() { this.startedAt = performance.now(); return this; }
  elapsed() { return this.startedAt == null ? 0 : performance.now() - this.startedAt; }
  static fromNow(label) { return new Timer(label).start(); }
}
```

Classes give you: mandatory `new`, non-enumerable methods, `extends`/`super`, `#private` fields, and strict mode by default.

## Pitfalls

- **Replacing the whole prototype** (`Timer.prototype = { start() {} }`) drops the `constructor` property. Add it back, or extend the existing prototype instead.
- **Arrow functions can't be constructors**: `const T = () => {}; new T()` throws.
- **Mutable data on the prototype** (e.g. `Timer.prototype.laps = []`) is shared by all instances, a classic bug.
- **Losing `this`** when passing `t.start` as a callback. Bind it or use an arrow wrapper.

## In an interview, mention…

- PascalCase function + `new` + `this` for data + `prototype` for shared methods.
- The `new.target` guard and the constructor-property fix for inheritance.
- That `class` is the recommended way today and maps directly onto this pattern.
