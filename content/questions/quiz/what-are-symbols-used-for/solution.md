## TL;DR

A **`Symbol`** is a primitive whose every instance is **unique**, so it's mainly used as a **property key that cannot collide** with any string key or any other library's symbol. Symbol-keyed properties are **skipped by `for…in`, `Object.keys` and `JSON.stringify`**, which makes them good for metadata. **Well-known symbols** such as `Symbol.iterator`, `Symbol.asyncIterator`, `Symbol.toPrimitive` and `Symbol.hasInstance` let your objects **hook into built-in language behaviour**. `Symbol.for(key)` gives shared symbols via a global registry.

## Unique keys

```js
const id = Symbol('id');      // description is only for debugging
const id2 = Symbol('id');
id === id2;                   // false, always unique

const user = { name: 'Ada', [id]: 123 };
user[id];                     // 123
Object.keys(user);            // ['name']
JSON.stringify(user);         // '{"name":"Ada"}'
Object.getOwnPropertySymbols(user); // [Symbol(id)]
Reflect.ownKeys(user);        // ['name', Symbol(id)]
```

Symbols are **not private**: anyone can find them via `Object.getOwnPropertySymbols`. They prevent *accidental* clashes, not access. For real privacy use `#private` fields.

## Typical uses

**1. Attaching metadata to objects you don't own,** without breaking their serialisation or enumeration:

```js
const CACHE = Symbol('cache');
function enhance(obj) { obj[CACHE] ??= new Map(); return obj; }
```

**2. Well-known symbols to customise language behaviour:**

```js
class Temperature {
  constructor(c) { this.c = c; }
  [Symbol.toPrimitive](hint) {
    return hint === 'string' ? `${this.c}°C` : this.c;
  }
  get [Symbol.toStringTag]() { return 'Temperature'; }
}
const t = new Temperature(21);
`${t}`;                          // '21°C'
t + 1;                           // 22
Object.prototype.toString.call(t); // '[object Temperature]'
```

Others include `Symbol.iterator` (make an object work with `for…of`), `Symbol.asyncIterator`, `Symbol.hasInstance` (customise `instanceof`) and `Symbol.species`. Newer additions are `Symbol.dispose` / `Symbol.asyncDispose` for **explicit resource management** (`using` declarations), which are shipping in Chromium and Firefox but not yet everywhere.

**3. Enum-like constants that can't be confused with strings:**

```js
const Status = Object.freeze({ Idle: Symbol('idle'), Loading: Symbol('loading') });
```

A raw string `'idle'` will never equal `Status.Idle`. That's safer, but it doesn't serialise, so string unions are usually more practical in TypeScript and for network data.

**4. Brand checks across modules:** React marks elements with `$$typeof: Symbol.for('react.element')` (`'react.transitional.element'` in React 19). Because a JSON payload can't contain a symbol, this blocks XSS attacks where an attacker injects a fake element object through JSON.

## `Symbol()` vs `Symbol.for()`

```js
Symbol.for('app.key') === Symbol.for('app.key'); // true, global registry
Symbol.keyFor(Symbol.for('app.key'));            // 'app.key'
```

Registered symbols are shared **across realms** (iframes, workers), which is why React uses them. Unregistered symbols are unique per call.

## Pitfalls

- `new Symbol()` throws. Symbols are primitives, created by calling `Symbol()`.
- Implicit string conversion throws: `'x' + Symbol()` is a `TypeError`. Use `String(sym)` or `sym.description`.
- Symbols are lost by `JSON.stringify` and by `structuredClone`/`postMessage` (symbol-keyed properties are ignored; symbol values throw).
- Spread and `Object.assign` *do* copy own enumerable symbol properties.

## In an interview, mention…

- Uniqueness and collision-free keys, and that this is not privacy.
- Well-known symbols as the language's extension points (iteration, coercion, disposal).
- The React `$$typeof` example as a real-world security use of symbols.
