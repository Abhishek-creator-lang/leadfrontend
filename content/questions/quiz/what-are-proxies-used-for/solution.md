## TL;DR

A **`Proxy`** wraps a target object and lets you **intercept fundamental operations** (property get/set, `in`, `delete`, enumeration, function calls, `new`) through **trap** functions in a handler. **`Reflect`** provides the matching default behaviour for each trap, so you can add logic and then forward. Proxies power **reactivity systems (Vue 3, MobX, Immer), validation, logging, access control and API mocking**. They cost performance and have identity and private-field caveats, so use them in infrastructure code, not everywhere.

## Basic shape

```js
const target = { name: 'Ada' };
const logged = new Proxy(target, {
  get(obj, key, receiver) {
    console.log(`read ${String(key)}`);
    return Reflect.get(obj, key, receiver);
  },
  set(obj, key, value, receiver) {
    console.log(`write ${String(key)} = ${value}`);
    return Reflect.set(obj, key, value, receiver); // must return true for success
  },
});
logged.name;        // logs "read name"
logged.age = 36;    // logs "write age = 36", and target.age is now 36
```

There are 13 traps, including `has`, `deleteProperty`, `ownKeys`, `getOwnPropertyDescriptor`, `defineProperty`, `apply` and `construct`.

## Common uses

**Validation:**

```js
const schema = { age: (v) => Number.isInteger(v) && v >= 0 };
const person = new Proxy({}, {
  set(obj, key, value) {
    if (schema[key] && !schema[key](value)) throw new TypeError(`invalid ${key}`);
    return Reflect.set(obj, key, value);
  },
});
person.age = 30;   // ok
person.age = -1;   // TypeError
```

**Reactivity / change tracking** (the core idea behind Vue 3's `reactive()`):

```js
function reactive(obj, onChange) {
  return new Proxy(obj, {
    get(t, k, r) {
      const v = Reflect.get(t, k, r);
      return typeof v === 'object' && v !== null ? reactive(v, onChange) : v; // lazy deep wrap
    },
    set(t, k, v, r) {
      const ok = Reflect.set(t, k, v, r);
      onChange(k, v);
      return ok;
    },
  });
}
```

Unlike `Object.defineProperty` getters, a proxy sees **added and deleted keys** and array index writes, which is why Vue moved to proxies.

**Immutable drafts:** Immer hands you a proxy "draft", records your mutations, and produces a new structurally shared object, which is used by Redux Toolkit's `createSlice`.

**Defaults, negative array indices, read-only views, API clients** that turn `api.users.get()` into `GET /users`, and **test doubles** that record every call.

**Revocable access:** `Proxy.revocable(target, handler)` returns `{ proxy, revoke }`, useful when handing an object to untrusted plugin code temporarily.

## Pitfalls

- **Performance:** every intercepted operation runs a JS function and defeats some engine optimisations. Don't wrap hot data paths without measuring.
- **Identity:** `proxy !== target`. Sets, `WeakMap` keys and `===` comparisons treat them as different objects. Libraries keep a `WeakMap` from target to proxy so the same target always gets the same proxy.
- **Private fields and internal slots:** `#private` fields and built-ins with internal slots (`Map`, `Set`, `Date`, DOM nodes) fail when methods run with the proxy as `this`, e.g. `new Proxy(new Map(), {}).get('x')` throws a `TypeError`. You need to bind methods to the target in the `get` trap.
- **Invariants:** traps must respect the target's non-configurable/non-extensible properties, otherwise the engine throws. For example, `get` must return the actual value of a non-writable, non-configurable property.
- **Always use `Reflect` with `receiver`** so getters and inheritance behave correctly.
- Proxies are hard to debug, since DevTools shows `[[Handler]]` and `[[Target]]`, and "magic" behaviour surprises teammates.

## In an interview, mention…

- Traps plus `Reflect` forwarding as the pattern.
- Real libraries that depend on proxies (Vue 3, MobX, Immer, Valtio) and why proxies beat `defineProperty` for reactivity.
- The caveats: performance, identity, private fields/internal slots, and invariants.
