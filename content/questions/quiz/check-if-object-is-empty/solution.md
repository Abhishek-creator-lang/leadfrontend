## TL;DR

For a **plain object**, the idiomatic check is **`Object.keys(obj).length === 0`**, combined with a guard that the value really is a plain object (not `null`, an array, a `Date`, a `Map`…). "Empty" has several possible meanings: no own *enumerable string* keys (`Object.keys`), no own keys at all including **non-enumerable and symbol** keys (`Reflect.ownKeys`), or no keys anywhere on the prototype chain (`for…in`). Pick the definition deliberately.

## The usual answer

Split the "is it a plain object?" guard from the emptiness check. Cramming both into one boolean expression makes `&&`/`||` precedence mistakes easy:

```js
function isPlainObject(value) {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function isEmptyObject(value) {
  return isPlainObject(value) && Object.keys(value).length === 0;
}

isEmptyObject({});                       // true
isEmptyObject(Object.create(null));      // true
isEmptyObject({ a: undefined });         // false: the key exists
isEmptyObject([]);                       // false: not a plain object
isEmptyObject(new Date());               // false: Object.keys would say "empty"
isEmptyObject(null);                     // false instead of throwing
```

## Choosing the definition of "empty"

```js
const sym = Symbol('meta');
const o = {};
Object.defineProperty(o, 'hidden', { value: 1, enumerable: false });
o[sym] = 2;

Object.keys(o).length;          // 0 → "empty" by enumerable string keys
Reflect.ownKeys(o).length;      // 2 → not empty if you count everything
JSON.stringify(o) === '{}';     // true, but slow and misleading
```

| Check | Counts | Notes |
|---|---|---|
| `Object.keys(o).length === 0` | Own, enumerable, string keys | Best default; matches what spread and JSON see |
| `Reflect.ownKeys(o).length === 0` | All own keys incl. symbols and non-enumerable | Strictest |
| `for (const k in o) return false` | Enumerable keys **including inherited** ones | Short-circuits; add `Object.hasOwn(o, k)` to ignore inherited keys |
| `JSON.stringify(o) === '{}'` | Serialisable keys | Avoid: allocates a string, ignores `undefined`/function values, throws on cycles and BigInt |

For large objects, a `for…in` loop with an early return avoids allocating the key array. It rarely matters, but it's a good follow-up answer.

## Other collection types

"Is it empty?" depends on the type, so a generic helper should branch:

```js
function isEmpty(value) {
  if (value == null) return true;
  if (typeof value === 'string' || Array.isArray(value)) return value.length === 0;
  if (value instanceof Map || value instanceof Set) return value.size === 0;
  if (isPlainObject(value)) return Object.keys(value).length === 0;
  return false; // numbers, dates, class instances: decide explicitly
}
```

## Pitfalls

- **`Object.keys(null)` throws** a `TypeError`. Guard first.
- **`Object.keys` on a `Map`, `Set` or `Date` returns `[]`**, so a naive check calls them empty.
- `obj === {}` is always `false`, because it compares references.
- **Class instances with only getters/methods** have no own keys, so they look empty. Usually you shouldn't be asking this question about them.
- Lodash's `_.isEmpty` uses its own rules (e.g. `isEmpty(1) === true`). Know your utility's semantics before relying on it.

## In an interview, mention…

- Clarify what "empty" means (own vs inherited, enumerable, symbols) and which object types are in scope.
- Guard against `null` and non-plain objects.
- Explain why `JSON.stringify` comparison is a bad idea, and mention the early-exit `for…in` for performance.
