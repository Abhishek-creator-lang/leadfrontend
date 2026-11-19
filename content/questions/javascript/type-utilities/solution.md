## Approach

`typeof` is the right tool for primitives, because it reports the **primitive** type and returns `'object'` for boxed values:

```js
export const isBoolean = (v) => typeof v === 'boolean';
export const isNumber = (v) => typeof v === 'number';
export const isString = (v) => typeof v === 'string';
export const isSymbol = (v) => typeof v === 'symbol';
export const isBigInt = (v) => typeof v === 'bigint';
export const isNull = (v) => v === null;
export const isUndefined = (v) => v === undefined;
export const isNil = (v) => v == null; // the one idiomatic use of loose equality
```

`isPrimitive` is the complement of "is an object or a function":

```js
const isPrimitive = (v) => v === null || (typeof v !== 'object' && typeof v !== 'function');
```

That definition is future-proof: if a new primitive type is ever added (as `bigint` was in ES2020), it is automatically covered.

## The traps this question is testing

- **`typeof null === 'object'`.** A bug from the first JavaScript implementation, where `null` was the null pointer with an "object" type tag. It can never be fixed without breaking the web. Always test `null` with `=== null`.
- **`NaN` is a number.** `typeof NaN === 'number'`. If you need a "real" number, use `Number.isFinite(v)` (which is also false for `±Infinity`) or `Number.isNaN` to detect it. The global `isNaN` coerces its argument (`isNaN('abc') === true`), so avoid it.
- **Boxed primitives.** `new Boolean(false)` is a truthy *object*. `typeof` returns `'object'`, which is what we want. Checking with `Object.prototype.toString.call(v) === '[object Boolean]'` would wrongly accept boxed values.
- **`isNil` and `== null`.** Loose equality to `null` matches exactly `null` and `undefined`, nothing else (not `0`, `''` or `false`).

## Complexity

All predicates are O(1).

## Common mistakes

| Mistake | Consequence |
|---|---|
| `typeof v === 'object'` for "is object" | Accepts `null` |
| `!isNaN(v)` as "is number" | `'42'`, `''`, `null` and `true` all pass |
| `v instanceof Number` | Fails for primitives and across realms (iframes) |
| `Object.prototype.toString` for primitives | Accepts boxed objects |
| `!v` as "is nil" | Treats `0`, `''` and `false` as missing |

## Follow-ups

- **Finite and integer checks:** `Number.isFinite(v)` and `Number.isInteger(v)` do not coerce, unlike the globals. `Number.isSafeInteger` adds the ±2^53 − 1 bound.
- **Undeclared variables:** `typeof undeclaredVar` returns `'undefined'` without throwing, which is why feature detection such as `typeof window !== 'undefined'` still uses it. In ES3, `undefined` was a writable global, so `x === undefined` could be fooled. That has not been true since ES5.
- **TypeScript:** these functions become type guards with a return type such as `v is string`, which narrows the type in the calling code.
