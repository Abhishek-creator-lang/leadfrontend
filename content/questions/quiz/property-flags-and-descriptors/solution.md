## TL;DR

Every object property has a **descriptor** describing how it behaves. **Data properties** have `value` and **`writable`**; **accessor properties** have `get`/`set`. Both kinds have **`enumerable`** (shows up in `for…in`/`Object.keys`/spread/JSON) and **`configurable`** (can be deleted or redefined). Properties created by assignment get all flags `true`; properties created with **`Object.defineProperty` default to `false`**. `Object.freeze`, `Object.seal` and class/built-in methods are all built on these flags.

## Reading and defining

```js
const user = { name: 'Ada' };
Object.getOwnPropertyDescriptor(user, 'name');
// { value: 'Ada', writable: true, enumerable: true, configurable: true }

Object.defineProperty(user, 'id', { value: 7 }); // all flags default to false
Object.getOwnPropertyDescriptor(user, 'id');
// { value: 7, writable: false, enumerable: false, configurable: false }

Object.keys(user);   // ['name'], since id isn't enumerable
user.id = 8;         // silently ignored in sloppy mode, TypeError in strict mode/modules
delete user.id;      // false (or TypeError in strict mode)
```

## What each flag controls

| Flag | When `false` |
|---|---|
| `writable` | Assignment fails (data properties only) |
| `enumerable` | Hidden from `for…in`, `Object.keys/values/entries`, spread, `Object.assign`, `JSON.stringify`. Still visible to `Object.getOwnPropertyNames` and `Reflect.ownKeys` |
| `configurable` | Can't delete, can't switch between data/accessor, can't change `enumerable`. You *can* still change `writable` from `true` to `false` (one way only) |

Accessor descriptor:

```js
const temp = { _c: 20 };
Object.defineProperty(temp, 'f', {
  get() { return this._c * 9 / 5 + 32; },
  set(v) { this._c = (v - 32) * 5 / 9; },
  enumerable: true,
  configurable: true,
});
```

A descriptor cannot have both `value`/`writable` and `get`/`set`, or `defineProperty` throws.

## Object-level helpers built on flags

```js
Object.preventExtensions(o); // no new properties
Object.seal(o);              // + every property configurable: false
Object.freeze(o);            // + every data property writable: false
Object.isFrozen(o);          // true
```

All three are **shallow**: nested objects stay mutable unless frozen recursively.

## Where you meet descriptors in real code

- **Built-ins:** `Array.prototype.map` is non-enumerable, which is why `for…in` over an array doesn't list methods. Polyfills must use `defineProperty` with `enumerable: false` to match.
- **Classes:** methods are defined non-enumerable on the prototype, so `{ ...instance }` copies only fields.
- **Library internals:** Vue 2 reactivity used `defineProperty` getters/setters on each key (and couldn't detect added keys, which is why Vue 3 moved to `Proxy`). MobX and some ORMs still use accessors.
- **Constants on shared objects:** `Object.defineProperty(window, 'APP_VERSION', { value: '1.4.0' })` makes it read-only for third-party scripts.
- **Copying with flags:** `Object.defineProperties({}, Object.getOwnPropertyDescriptors(src))` clones getters as getters, whereas spread would call them and copy values.

## Pitfalls

- Forgetting the `false` defaults: `defineProperty(o, 'x', { value: 1 })` makes `x` read-only, hidden and permanent, often by accident.
- Silent failures in sloppy mode. Always run in strict mode (modules and classes are strict by default).
- Inherited non-writable properties block assignment on children: if a prototype has a non-writable `x`, `child.x = 1` fails instead of creating an own property.

## In an interview, mention…

- The four flags, the two descriptor kinds and the `false` defaults of `defineProperty`.
- How freeze/seal/preventExtensions map onto them and that they're shallow.
- Practical uses: non-enumerable methods, polyfills, Vue 2-style reactivity, and cloning with `getOwnPropertyDescriptors`.
