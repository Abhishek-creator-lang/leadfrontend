## TL;DR

**`Object.preventExtensions(obj)`** makes an object **non-extensible**: **no new properties can be added**, and its prototype can't be changed. Existing properties can still be **modified and deleted**. It's the weakest of the three integrity levels: **`preventExtensions` < `seal` < `freeze`**. All three are **shallow** and irreversible.

## Behaviour

```js
'use strict';
const config = { retries: 3 };
Object.preventExtensions(config);

config.retries = 5;        // ✅ allowed
delete config.retries;     // ✅ allowed
config.timeout = 1000;     // ❌ TypeError in strict mode (silently ignored in sloppy mode)
Object.setPrototypeOf(config, {}); // ❌ TypeError
Object.isExtensible(config);       // false
```

Properties inherited from the prototype are unaffected. If the prototype gains a property, the object sees it, because only the object's *own* property set is locked.

## Comparison

| | Add props | Delete props | Change values | Reconfigure props |
|---|---|---|---|---|
| `Object.preventExtensions` | ❌ | ✅ | ✅ | ✅ |
| `Object.seal` | ❌ | ❌ | ✅ | ❌ |
| `Object.freeze` | ❌ | ❌ | ❌ | ❌ |

Checks: `Object.isExtensible`, `Object.isSealed`, `Object.isFrozen`. There's no "un-prevent": once non-extensible, always non-extensible.

## When it's useful

- **Catching typos on objects with a fixed shape.** In strict mode, `options.retires = 5` throws instead of quietly creating a new property:

```js
class Options {
  retries = 3;
  timeout = 1000;
  constructor() { Object.preventExtensions(this); }
}
const o = new Options();
o.retries = 5;  // fine
o.retires = 5;  // TypeError: Cannot add property retires, object is not extensible
```

- **Defensive APIs** that hand objects to plugins and don't want new keys smuggled in, while still allowing updates.
- **Proxies:** a proxy's traps must respect the target's extensibility, so `preventExtensions` is part of the invariants you need to understand when writing traps.
- In practice **TypeScript** covers the typo-catching use case at compile time, so runtime `preventExtensions` is rare in application code. You'll see `freeze` more often (for constants and dev-mode immutability checks, as Redux Toolkit/Immer do).

## Pitfalls

- **Silent failure in sloppy mode.** Without strict mode (modules and classes are strict by default), additions are simply ignored, which hides bugs.
- **Shallow:** nested objects remain extensible.
- **Subclass fields:** if a base class calls `Object.preventExtensions(this)` in its constructor, a subclass's field initialisers (which run after `super()`) will throw. Lock in the most-derived constructor, or check `new.target`.
- **Performance:** non-extensible objects are fine in modern engines, but avoid toggling integrity levels on hot objects. It can cause shape transitions.
- Some built-ins behave specially, e.g. array `length` still works for non-extensible arrays, but `push` throws because it adds an index property.

## In an interview, mention…

- Where it sits in the preventExtensions / seal / freeze ladder and that all are shallow.
- Strict-mode behaviour (throws) vs sloppy mode (silent).
- Its role in proxy invariants, and that TypeScript usually solves the "fixed shape" problem earlier.
