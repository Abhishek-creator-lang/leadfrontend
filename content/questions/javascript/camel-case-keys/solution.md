## Approach

Split the problem in two: converting a single key, and walking the data.

### Converting a key

A regular expression with a lookbehind expresses the rule "underscores with a character on both sides":

```js
const toCamel = (key) => key.replace(/(?<=[^_])_+([^_])/g, (_, ch) => ch.toUpperCase());
```

- `(?<=[^_])` requires a non-underscore character before the run, but does not consume it. That matters for `a_b_c`: after replacing `_b`, the engine can still see `b` as the "previous character" for `_c`. A version that *consumes* the previous character, such as `/([^_])_+([^_])/g`, skips every second match and produces `aB_c`.
- `_+` collapses runs, so `double__under` becomes `doubleUnder`.
- `([^_])` captures the character to upper-case. Because it is required, trailing underscores never match, and because the lookbehind is required, leading underscores never match.

A manual loop over the characters is an equally good answer if you'd rather not rely on lookbehind (supported in all modern engines since 2020 or so).

### Walking the data

```js
function camelCaseKeys(value) {
  if (Array.isArray(value)) return value.map(camelCaseKeys);
  if (!isPlainObject(value)) return value;
  const out = {};
  for (const [key, child] of Object.entries(value)) out[toCamel(key)] = camelCaseKeys(child);
  return out;
}
```

`isPlainObject` checks `Object.getPrototypeOf(value)` is `Object.prototype` or `null`. Without it, a `Date` would be walked as an object with no own keys and come back as `{}`, silently destroying data.

## Complexity

O(n + total key length) time, where n is the number of nodes, and O(n) space for the new structure plus O(depth) recursion stack.

## Edge cases

- **Non-plain objects** (Date, Map, class instances) are returned by reference, as required.
- **Arrays of primitives** are copied shallowly: `[1, 2]` becomes a new array `[1, 2]`.
- **Collisions:** if both `a_b` and `aB` exist, the later key in insertion order wins. The spec doesn't forbid it, but in an interview say so explicitly.
- **Cycles:** this version overflows the stack on circular input. JSON from an API cannot contain cycles, which is the usual justification; a `WeakMap` of visited nodes fixes it.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `typeof value === 'object'` as the object test | Dates and Maps are turned into `{}`, and `null` crashes |
| A regex that consumes the previous character | `a_b_c` becomes `aB_c` |
| `split('_')` and capitalising each part | Leading underscores are lost, and `__` produces empty segments |
| Mutating keys in place (`delete obj[k]`) | Corrupts the caller's data and any cached responses |
| Lower-casing the rest of the key | `HTTP_code` turns into `httpCode`, which the spec forbids |

## Follow-ups

- **Where it belongs:** in the API client layer (for example an axios response interceptor or a typed `fetch` wrapper), so components never see snake_case. Do the inverse in the request serializer.
- **Round trip:** not lossless. `a_b` and `aB` both map to `aB`, and the inverse cannot know which original was meant. `_private` survives both directions only because of the leading-underscore rule.
- **Performance:** for large payloads, converting keys lazily (a `Proxy`) or generating typed mappers from a schema avoids walking the whole tree. Usually a plain walk is fast enough.
