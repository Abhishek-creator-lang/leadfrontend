## TL;DR

For regular functions, `this` is decided **at call time** by one of four rules, in order of precedence: **`new` binding** (`new F()` → the new object), **explicit binding** (`call`, `apply`, `bind` → the given object), **implicit binding** (`obj.method()` → `obj`), and **default binding** (plain `f()` → `undefined` in strict mode, `globalThis` in sloppy mode). **Arrow functions** ignore all of these and take `this` **lexically** from where they're defined.

## The four rules

```js
'use strict';
function whoAmI() { return this?.name ?? String(this); }

const ada = { name: 'Ada', whoAmI };
const bob = { name: 'Bob' };

// 1. Default binding
whoAmI();                     // 'undefined' (globalThis in sloppy mode)

// 2. Implicit binding: the object before the dot at the call site
ada.whoAmI();                 // 'Ada'

// 3. Explicit binding
whoAmI.call(bob);             // 'Bob'
whoAmI.apply(bob, []);        // 'Bob'
const bound = whoAmI.bind(bob);
bound();                      // 'Bob'

// 4. new binding
function Person(name) { this.name = name; }
new Person('Cy').name;        // 'Cy'
```

## Precedence

```js
const boundToBob = whoAmI.bind(bob);

ada.boundToBob = boundToBob;
ada.boundToBob();             // 'Bob': explicit (bind) beats implicit
boundToBob.call(ada);         // 'Bob': a bound function can't be re-bound

function P(name) { this.name = name; }
const BoundP = P.bind({ name: 'ignored' });
new BoundP('Dee').name;       // 'Dee': new beats bind
```

Order: **`new` > explicit (`bind` > `call`/`apply`) > implicit > default**.

## Arrow functions: lexical `this`

```js
class Search {
  query = '';
  constructor(input) {
    input.addEventListener('input', (e) => {
      this.query = e.target.value; // `this` is the Search instance
    });
  }
}
```

Arrows have no `this` of their own, so `call`, `apply` and `bind` **can't change it**, and they can't be used with `new`. That's ideal for callbacks inside methods, but wrong for object methods that need the receiver:

```js
const counter = {
  n: 0,
  inc: () => this.n++, // `this` is the module/global this, not counter
};
```

## Other places that set `this`

- **DOM event listeners** (non-arrow): `this` is `event.currentTarget`.
- **Array methods** accept a `thisArg`: `arr.map(fn, ctx)` (ignored by arrows).
- **Class bodies:** methods are strict, so detached calls get `undefined`. **Class field arrow functions** (`handle = () => {}`) bind per instance.
- **Top level:** `this` is `undefined` in ES modules, `globalThis` (window) in classic scripts, and `module.exports` in CommonJS.
- **Getters/setters and proxies:** `this` is the receiver, which may be a proxy or a subclass instance.

## Pitfalls

- **Losing implicit binding:** `const f = obj.method; f()` or `setTimeout(obj.method)` → default binding.
- **Primitives as `this`:** in sloppy mode they get boxed (`this` becomes a `Number` object); strict mode keeps the primitive.
- **`bind` creates a new function each call**, so `removeEventListener(type, fn.bind(x))` can't remove a listener added with a different `bind` result. Store the bound function.

## In an interview, mention…

- The four rules plus arrows, and the precedence order with examples.
- That a bound function can't be re-bound, but `new` still overrides it.
- Practical choices: arrows for callbacks, `bind` or class-field arrows for passing methods, and avoiding arrows as object methods.
