## Approach

### `isArray`

Use `Array.isArray(value)`. It's the only check that is correct across realms (iframes, `vm` contexts, workers via structured clone) and for arrays with a modified prototype. Two alternatives and why they're weaker:

- `value instanceof Array` compares against *this* realm's `Array.prototype`. An array created in an iframe has a different `Array.prototype`, so the check returns `false`. It also returns `true` for `Object.create(Array.prototype)`, which isn't an array.
- `Object.prototype.toString.call(value) === '[object Array]'` works across realms and was the standard polyfill before ES5. Since ES2015 it can be spoofed: any object can define `Symbol.toStringTag` as `'Array'` and produce `'[object Array]'`, and an array with its own `Symbol.toStringTag` stops reporting `'Array'`.

### `isFunction`

`typeof value === 'function'`. This covers every callable: arrow, async, generator and async generator functions, classes (which are functions, even though calling them without `new` throws) and bound functions. Older libraries checked `toString` tags such as `'[object AsyncFunction]'` separately; `typeof` makes that unnecessary.

### `isObject`

```js
value !== null && (typeof value === 'object' || typeof value === 'function')
```

`typeof null` is `'object'` (a bug from the first JavaScript implementation that can never be fixed without breaking the web), so `null` must be excluded explicitly. Functions are objects too, so they're included.

### `isPlainObject`

1. If `value` isn't an object (by the check above, minus functions), return `false`.
2. `const proto = Object.getPrototypeOf(value)`.
3. Return `proto === null || proto === Object.prototype`.

That rejects arrays (`Array.prototype`), class instances (`Foo.prototype`), `Date`, `Map`, `RegExp` and so on, without listing them.

## Complexity

All four are O(1).

## Edge cases

- `isFunction(class {})` is `true`. If you need "callable without `new`", there's no reliable check; that's a good discussion point.
- `isObject(new Number(1))` is `true`: boxed primitives are objects.
- `isPlainObject(Object.create(null))` is `true`: dictionaries created this way are common in libraries.
- Cross-realm plain objects: an object literal from an iframe has that iframe's `Object.prototype`, so our `isPlainObject` returns `false`. lodash handles this by checking that the prototype's `constructor` is a function whose source matches `Object`'s. Mention it; don't implement it unless asked.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `typeof value === 'object'` for `isObject` | Includes `null`, excludes functions |
| `value.constructor === Object` for `isPlainObject` | Throws for `Object.create(null)` objects (no `constructor`), and any object can override `constructor` |
| `instanceof Array` | Fails across iframes |
| `toString` tag `'[object Object]'` for `isPlainObject` | Class instances also report `'[object Object]'` |

## Why deep utilities need `isPlainObject`

A deep clone or deep merge recurses into "containers". Using `isObject` would recurse into a `Date` (copying no own properties and losing the time), a class instance (losing its prototype and methods), or a DOM node (thousands of properties). `isPlainObject` limits recursion to the data shapes you actually mean, and lets everything else be copied by reference or handled by a specific branch.

## Follow-ups interviewers ask

- **`isArrayLike`:** a non-function object with an integer `length` between `0` and `Number.MAX_SAFE_INTEGER`.
- **`isPromise` / thenable:** `isObject(value) && typeof value.then === 'function'`, which is exactly how the Promise spec decides what to adopt.
- **TypeScript:** each check becomes a type guard (`value is unknown[]`, `value is Record<string, unknown>`).
