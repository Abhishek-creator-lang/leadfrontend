## Approach

`isEmpty` is a type dispatch. Order the checks from most specific to most general, because some types match several rules (an array is also an object, a `Map` has no own keys):

1. `value == null` → `true`. The loose `==` covers both `null` and `undefined` in one check.
2. Strings → `value.length === 0`.
3. Arrays, typed arrays and `arguments` → `value.length === 0`. Use `Array.isArray`, `ArrayBuffer.isView` (true for typed arrays and `DataView`, which has no `length`, so check typed arrays specifically) and `Object.prototype.toString.call(value) === '[object Arguments]'`.
4. `Map` / `Set` → `value.size === 0`.
5. Any other object or function → `Object.keys(value).length === 0`. `Object.keys` returns exactly "own enumerable string keys", and it works on `Object.create(null)` objects, which have no `hasOwnProperty` method.
6. Everything else (numbers, booleans, symbols, bigints) → `true`.

### Why `Map`/`Set` must come before the object rule

A `Map` stores its entries internally, not as properties. `Object.keys(new Map([['a', 1]]))` is `[]`, so without the size check every map would look empty.

### Short-circuit the key count

`Object.keys` allocates an array of every key just to compare its length to zero. For huge objects, a `for…in` loop with an `Object.hasOwn` check that returns `false` on the first own key is O(1) in the non-empty case. Both are acceptable in an interview; mention the trade-off.

## Complexity

O(1) for everything except plain objects, which are O(k) with `Object.keys` (k own keys) or O(1) best case with the early-exit loop.

## Edge cases

- `[undefined]` and `[,]` both have length 1, so they're not empty.
- `{ a: undefined }` has a key, so it's not empty.
- `new Date()`, `/re/` and `function () {}` have no own enumerable keys, so they're empty. That's surprising but consistent with the rule (and with lodash).
- `Object.create({ inherited: 1 })` is empty: inherited keys don't count.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `JSON.stringify(value) === '{}'` | `{ a: undefined }`, `{ fn() {} }` and symbol keys stringify to `{}`; `Map` too; also O(size) and can throw on cycles or BigInt |
| `Object.keys` before the `Map`/`Set` check | Every `Map` and `Set` is reported as empty |
| `value.length === 0` for every object | Plain objects have no `length`, so `undefined === 0` is false and `{}` is "not empty" |
| `typeof value === 'object'` as the only object check | Functions fall through to the primitive branch by accident; it works here only because both return `true` for no keys, and breaks once a function has own properties |
| `value.hasOwnProperty(key)` in a loop | Throws on `Object.create(null)` objects |

## Follow-ups interviewers ask

- **API design:** `isEmpty(42) === true` is a well-known lodash wart. In application code, prefer specific checks (`arr.length === 0`, `map.size === 0`, `Object.keys(obj).length === 0`) so the intent and the type are obvious, and TypeScript can help.
- **Deep emptiness:** "is this form state empty?" usually means every field is `''`, `null` or an empty collection. That's a recursive check with its own rules.
- **Iterables:** a generic version could check `value[Symbol.iterator]().next().done`, but that consumes one element from one-shot iterators like generators.
