## Approach: recursive descent

JSON's grammar is tiny and **LL(1)**: the first non-whitespace character always tells you what comes next.

| Next char | Parse |
|---|---|
| `{` | object |
| `[` | array |
| `"` | string |
| `-` or a digit | number |
| `t` / `f` / `n` | `true` / `false` / `null` |
| anything else | syntax error |

So we write one function per grammar rule, each consuming characters from a shared cursor `i` and returning a value. Functions call each other recursively for nested values, which is why it's called recursive descent. The top level is `skipWs(); const v = parseValue(); skipWs(); if (i !== text.length) error();`. That last check rejects trailing garbage like `1 2` or `{}x`.

### Objects and arrays

```text
parseArray:  '['  ws  ( ']' | value ws ( ',' ws value ws )* ']' )
parseObject: '{'  ws  ( '}' | string ws ':' ws value ws ( ',' ws string ws ':' ws value ws )* '}' )
```

Handle the empty case right after the opening bracket. After each member, expect either `,` (then another member is **required**, which rejects trailing commas) or the closing bracket.

**Prototype pollution:** assigning `obj['__proto__'] = value` on a normal object invokes the `__proto__` setter and changes the prototype. `JSON.parse` defines an own property instead. We get the same result with `Object.defineProperty(obj, key, { value, writable: true, enumerable: true, configurable: true })`. This matters because "parse JSON, then deep-merge it into config" is a classic pollution vector.

### Numbers

Validate the exact grammar with the cursor rather than a permissive `parseFloat`: `parseFloat('01')` returns `1` and `parseFloat('1.')` returns `1`, but both are invalid JSON. After scanning `-? (0 | [1-9][0-9]*) (\.[0-9]+)? ([eE][+-]?[0-9]+)?`, convert the slice with `Number(...)`. Alternatively, a sticky regex (`/-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y` with `lastIndex = i`) does the scan in one step.

### Strings

Loop until the closing `"`:

- `\` followed by one of `" \ / b f n r t` maps to the character; `u` must be followed by exactly four hex digits, converted with `String.fromCharCode(parseInt(hex, 16))`. Surrogate pairs work automatically because two `\uXXXX` escapes produce two UTF-16 code units, which form a valid pair when concatenated.
- A raw character below `0x20` is an error (JSON requires `\n` rather than a literal newline).
- Reaching the end of input without a closing quote is an error.

For speed, copy runs of ordinary characters with `slice` rather than appending one character at a time.

## Complexity

O(n) time: every character is examined a constant number of times. Space is O(n) for the result plus O(depth) for recursion.

## Deep nesting

`'['.repeat(100000)` makes the parser recurse 100,000 levels and throws `RangeError: Maximum call stack size exceeded`. That's a denial-of-service vector if you parse untrusted input on a server. Defences: a maximum depth counter (throw a `SyntaxError` past, say, 1,000), or an iterative parser with an explicit stack. Native `JSON.parse` in V8 is iterative for this reason.

## Edge cases

- Whitespace only, or an empty string: error ("unexpected end of input").
- `"é"` vs the literal `é`: both valid and equal.
- `-` alone, `1e`, `1e+`, `.5`, `+1`, `1.`, `0x10`, `Infinity`: all errors.
- `tru`, `nulls`: errors. Match the whole literal, then require that the cursor is followed by a valid delimiter, which the trailing-input check handles.
- Duplicate keys: the later one overwrites.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Using `parseFloat` / `Number` on a guessed slice | Accepts `01`, `1.`, `Infinity`, hex |
| Not checking for trailing input | `'{} garbage'` parses |
| Allowing a comma before `]` / `}` | Accepts trailing commas |
| `obj[key] = value` | `"__proto__"` keys pollute the prototype |
| Accepting single quotes or raw newlines in strings | Not JSON (that's JSON5) |
| Using `\s` for whitespace | Also accepts non-JSON whitespace like ` ` and `\v` |

## Real-world connection

- **Streaming parsers** (`JSONStream`, `@streamparser/json`) use the same state machine, fed chunk by chunk, so huge responses can be processed without buffering everything.
- **Configuration formats** like JSON5 and JSONC (used by `tsconfig.json` and VS Code settings) relax exactly the rules enforced here: comments, trailing commas, unquoted keys.
- **Security reviews** look for parse-then-merge pollution and unbounded nesting in API servers.

## Follow-ups

- **`reviver`:** after parsing, walk the result bottom-up and call `reviver.call(holder, key, value)`, deleting properties when it returns `undefined`.
- **Better errors:** track line and column for messages like `Unexpected token } at line 3, column 14`.
- **BigInt preservation:** detect integers beyond `Number.MAX_SAFE_INTEGER` and return `BigInt`s or strings (the TC39 "JSON.parse source text access" proposal enables this natively).
