Implement `jsonParse(text)`, which behaves like `JSON.parse(text)` **without the `reviver` argument**. Do not use `JSON.parse`, `eval` or `new Function`.

```js
jsonParse('{"name":"Ada","langs":["en","fr"],"age":36}');
// { name: 'Ada', langs: ['en', 'fr'], age: 36 }

jsonParse(' [1, -2.5e3, true, null] '); // [1, -2500, true, null]
jsonParse('"caf\\u00e9\\n"');          // 'café\n'

jsonParse('{a:1}');   // throws SyntaxError (keys must be quoted)
jsonParse('[1,]');    // throws SyntaxError (no trailing commas)
jsonParse('01');      // throws SyntaxError (no leading zeros)
```

## Grammar to support (all of JSON)

- **Whitespace** between tokens: space, tab, `\n`, `\r` only.
- **Literals:** `true`, `false`, `null`.
- **Numbers:** optional `-`, then `0` or a non-zero digit followed by digits, then an optional fraction (`.` followed by at least one digit), then an optional exponent (`e`/`E`, optional `+`/`-`, at least one digit). No leading `+`, no leading zeros, no `.5`, no `5.`, no `NaN`/`Infinity`.
- **Strings:** double quotes only. Escapes: `\"`, `\\`, `\/`, `\b`, `\f`, `\n`, `\r`, `\t`, and `\uXXXX` (exactly four hex digits). Unescaped control characters (below `U+0020`) are **not** allowed inside strings.
- **Arrays** `[ ... ]` and **objects** `{ "key": value, ... }`, with no trailing commas. Duplicate keys: the last one wins.
- The whole input must be exactly **one** value, optionally surrounded by whitespace.

## Requirements

- Invalid input throws a `SyntaxError` (the message is up to you, but including the position is a nice touch).
- Non-string input is converted with `String(text)` first, like `JSON.parse`.
- Objects should be safe against prototype pollution: a `"__proto__"` key must become an own property, not change the prototype.

## Follow-up

- Why is a recursive-descent parser a natural fit for JSON?
- How could a deeply nested input crash your parser, and how would you defend against it?
- How would you add support for a `reviver`?
