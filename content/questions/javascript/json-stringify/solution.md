## Approach

The spec (ECMAScript `SerializeJSONProperty`) has a clear shape, and following it avoids most bugs. One recursive function, `serialize(holderValue, key, stack)`, returns either a string or `undefined` ("this value has no JSON representation"). The caller decides what `undefined` means: skip the property in an object, write `null` in an array, or return `undefined` at the top level.

For each value, in this order:

1. **`toJSON`.** If the value is an object (or a BigInt, per spec) with a callable `toJSON`, replace it with `value.toJSON(key)`. That's how `Date` works: `Date.prototype.toJSON` returns the ISO string. The key is passed because some `toJSON` implementations depend on it.
2. **Unwrap wrapper objects.** `new Number(5)` becomes `5`, `new String('a')` becomes `'a'`, `new Boolean(false)` becomes `false`. Detect them with `Object.prototype.toString.call(v)` (`'[object Number]'` etc.) and unwrap with `Number(v)` / `String(v)` / `v.valueOf()`. Note `Boolean(new Boolean(false))` is `true`, so use `valueOf`.
3. **Primitives:**
   - `null` gives `'null'`; booleans give `'true'` / `'false'`.
   - Strings are quoted.
   - Numbers: `Number.isFinite(v) ? String(v) : 'null'`. `String(-0)` is already `'0'`.
   - BigInt: throw `TypeError` (JSON has no big integers, and silently losing precision would be worse).
   - `undefined`, functions, symbols: return `undefined`.
4. **Objects and arrays:** check for cycles, then serialize members.

### Cycle detection

Keep a **stack** (an array or `Set`) of the objects currently being serialized, along the current path. If a value is already on the stack, it's a cycle: throw `TypeError`. Pop it when done.

A stack, not a "seen" set for the whole call, is essential: the same object can appear **twice without a cycle**. `const p = {}; jsonStringify({ a: p, b: p })` is fine and gives `{"a":{},"b":{}}`. A global "seen" set would wrongly throw.

### Arrays and objects

- Arrays: for `i` in `0..length-1`, serialize `value[i]` with key `String(i)`; `undefined` becomes `'null'`. Holes are read as `undefined`, so they become `null` too.
- Objects: for each key in `Object.keys(value)` (own, enumerable, string keys; symbol keys are skipped), serialize the value. Skip it if the result is `undefined`, otherwise emit `quote(key) + ':' + result`.

### Quoting strings

Walk the string by UTF-16 code unit:

- `"` and `\` are backslash-escaped; `\b \f \n \r \t` get short escapes.
- Other code units below `0x20` become `\u00xx`.
- **Surrogates:** a high surrogate (`0xD800`–`0xDBFF`) followed by a low surrogate (`0xDC00`–`0xDFFF`) is a valid pair, so copy both. Any unpaired surrogate is escaped as `\udxxx`. This is the "well-formed JSON.stringify" change from ES2019; before it, lone surrogates produced invalid UTF-8 when the result was sent over the network.

## Complexity

O(n) in the size of the input graph plus the output length. The cycle stack adds O(depth) space. Building the output with arrays and `join` avoids quadratic string concatenation.

## Edge cases checklist

- `jsonStringify(undefined)` returns `undefined`, not the string `'undefined'`.
- `{ a: undefined }` gives `'{}'`; `[undefined]` gives `'[null]'`.
- `toJSON` returning `undefined` makes the property disappear.
- `Map` and `Set` serialize as `{}` (no own enumerable keys); a common surprise.
- `-0` gives `'0'`; `1e21` gives `'1e+21'` (via `String`).
- Getters run (`Object.keys` + property access), which matches native behaviour.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `typeof value === 'object'` before checking `null` | `null` treated as an object |
| A global "seen" set for cycle detection | Shared (non-circular) references throw |
| Escaping with `replace` for a fixed list of characters | Misses control characters and lone surrogates |
| Treating `NaN` as a number | Produces invalid JSON `NaN` |
| `for...in` over objects | Includes inherited enumerable properties |
| Ignoring `toJSON` | `Date` serializes as `{}` |

## Real-world connection

- **Structured data over the wire:** `fetch(url, { body: JSON.stringify(data) })`. Knowing that `undefined` fields vanish explains "why didn't my PATCH clear that field?" Send `null` instead.
- **Redux DevTools and logging** serialize state; `Map`/`Set` and class instances lose information, which is why Redux recommends plain serializable state.
- **Cache keys:** `JSON.stringify` is key-order-sensitive (`{a,b}` vs `{b,a}`), so libraries like TanStack Query use a stable stringify that sorts keys.
- **Server-rendered data islands:** embedding JSON inside `<script>` additionally requires escaping `<` (or `</script>`) to avoid XSS, which `JSON.stringify` does **not** do.

## Follow-ups

- **`space`:** pass the current indent down; join members with `',\n' + indent` and wrap with newlines. Empty arrays and objects stay `[]` / `{}`.
- **`replacer` function:** call `replacer.call(holder, key, value)` right after `toJSON`; with an array replacer, it becomes the key allow-list.
- **Stable key order:** sort `Object.keys` for deterministic output.
