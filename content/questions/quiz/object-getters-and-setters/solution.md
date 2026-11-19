## TL;DR

**Getters (`get`) and setters (`set`) define accessor properties**: reading the property calls a function, and assigning to it calls another. Callers keep plain `obj.prop` syntax while you get **computed values, validation, lazy initialisation and encapsulation** behind it. Use them for cheap, side-effect-free derivations; avoid hiding expensive work or surprising side effects behind what looks like a field access.

## Syntax

```js
const user = {
  first: 'Ada',
  last: 'Lovelace',
  get fullName() { return `${this.first} ${this.last}`; },
  set fullName(value) {
    [this.first, this.last] = value.split(' ');
  },
};
user.fullName;               // 'Ada Lovelace'
user.fullName = 'Grace Hopper';
user.first;                  // 'Grace'
```

In classes, accessors go on the prototype (shared, non-enumerable) and pair well with `#private` fields:

```js
class Temperature {
  #celsius = 0;
  get celsius() { return this.#celsius; }
  set celsius(v) {
    if (typeof v !== 'number' || Number.isNaN(v)) throw new TypeError('number expected');
    this.#celsius = v;
  }
  get fahrenheit() { return this.#celsius * 9 / 5 + 32; } // read-only derived value
}

const t = new Temperature();
t.celsius = 25;
t.fahrenheit;   // 77
t.fahrenheit = 0; // ignored in sloppy mode, TypeError in strict mode (no setter)
```

You can also add accessors to existing objects with `Object.defineProperty(obj, 'x', { get, set })`.

## What they're good for

- **Derived values** that should never get out of sync (`fullName`, `area`, `isEmpty`).
- **Validation and normalisation** on write (`set email(v) { this.#email = v.trim().toLowerCase(); }`).
- **Read-only public views** of private state: a getter with no setter.
- **Lazy, memoised properties**, where the getter replaces itself with a data property on first access:

```js
const config = {
  get parsed() {
    const value = JSON.parse(hugeString);
    Object.defineProperty(this, 'parsed', { value }); // later reads skip the getter
    return value;
  },
};
```

- **Evolving an API without breaking callers:** change a field into a computed property and nobody needs to update `obj.size` to `obj.getSize()`.
- **Observation:** frameworks (Vue 2, MobX, Lit's reactive properties) use setters to trigger re-rendering when a value changes.

## Pitfalls

- **Infinite recursion:** `set name(v) { this.name = v; }` calls itself. Store the value in a separate (ideally private) field.
- **Surprising cost or side effects:** developers assume property reads are cheap and idempotent. A getter that fetches, allocates heavily or mutates state violates that.
- **Copying loses accessors:** spread, `Object.assign` and `JSON.stringify` call the getter and copy the *value*. Class getters live on the prototype and aren't copied at all.
- **Missing pair:** a getter without a setter makes assignment silently fail in sloppy mode. A setter without a getter makes reads return `undefined`.
- **Debugging:** DevTools shows `(...)` until you click to invoke a getter, because evaluating it might have side effects.

## In an interview, mention…

- Accessors keep the property syntax while running code. That's an encapsulation tool, not just syntactic sugar.
- Pair them with `#private` fields for validation and read-only views.
- They should stay cheap and side-effect-free, and they don't survive spread/JSON copies, which matters for immutable state and serialisation.
