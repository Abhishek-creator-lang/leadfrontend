Implement `jsonStringify(value)`, which behaves like `JSON.stringify(value)` **with no `replacer` or `space` argument**. For every input in the subset below, your output must be identical to the native function's.

```js
jsonStringify({ a: [1, 'two', null], b: true });  // '{"a":[1,"two",null],"b":true}'
jsonStringify('He said "hi"\n');                  // '"He said \\"hi\\"\\n"'
jsonStringify([undefined, () => {}, NaN]);        // '[null,null,null]'
jsonStringify({ a: undefined, b: Symbol('x') });  // '{}'
jsonStringify(new Date(0));                       // '"1970-01-01T00:00:00.000Z"'
jsonStringify(undefined);                         // undefined (not a string)
```

## Subset to support

| Input | Output |
|---|---|
| `null` | `null` |
| `true` / `false` | `true` / `false` |
| Finite numbers | Their normal string form (`-0` becomes `0`) |
| `NaN`, `Infinity`, `-Infinity` | `null` |
| Strings | Quoted and escaped (see below) |
| Arrays | `[a,b,c]`. `undefined`, functions and symbols become `null` |
| Plain objects (and other objects such as `Map`, class instances) | `{"k":v,...}` over own enumerable **string** keys in `Object.keys` order. Properties whose value is `undefined`, a function or a symbol are skipped |
| Objects with a `toJSON` method (including `Date`) | Serialize the result of `value.toJSON(key)`, where `key` is the property name, the array index as a string, or `''` at the top level |
| `new Number(1)`, `new String('s')`, `new Boolean(false)` | Treated as their primitive values |
| Top-level `undefined`, function or symbol | Returns `undefined` |
| `BigInt` | Throws `TypeError` |
| Circular references | Throw `TypeError` |

## String escaping

- `"` becomes `\"` and `\` becomes `\\`.
- `\b`, `\f`, `\n`, `\r`, `\t` use their short escapes.
- Any other code unit below `0x20` becomes `\u00XX` with **lower-case** hex digits.
- A **lone surrogate** (a high surrogate not followed by a low one, or a low surrogate not preceded by a high one) becomes `\uXXXX` with lower-case hex. Valid surrogate pairs (emoji) are output unchanged.
- Everything else is output as-is.

Not required: the `replacer` and `space` arguments.

## Follow-up

- Why does JSON drop `undefined` in objects but write `null` in arrays?
- How would you add the `space` (indentation) argument?
- Why might `JSON.stringify` be a poor choice for a cache key or deep-equality check?
