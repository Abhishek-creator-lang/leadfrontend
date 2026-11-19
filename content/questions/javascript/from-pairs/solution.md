## Approach

Create an empty object and assign each pair in order:

```js
for (const [key, value] of pairs) result[key] = value;
```

Destructuring handles both short pairs (`value` becomes `undefined`) and the "last one wins" rule, because a later assignment simply overwrites an earlier one. Property assignment converts non-symbol keys with `ToPropertyKey`, so `1` becomes `'1'` and a symbol stays a symbol.

`Object.fromEntries(pairs)` does the same thing in one call, and it also accepts any iterable (a `Map`, a generator). In real code use it; the exercise asks you to show you know what it does.

## Complexity

O(n) time and O(n) space for n pairs.

## Edge cases

- Duplicate keys: last wins, and the key keeps the position of its **first** insertion in the property order (that's how JavaScript objects order string keys).
- Integer-like keys (`'2'`, `'10'`) are always ordered first, ascending, regardless of insertion order. `Object.keys(fromPairs([['b', 1], ['2', 2]]))` is `['2', 'b']`.
- `'__proto__'`: plain assignment calls the inherited `__proto__` setter instead of creating an own property. `Object.fromEntries` uses `CreateDataProperty` and does create an own `__proto__` key. If keys come from user input, use `Object.defineProperty` or build a `Map`. This is a prototype-pollution vector worth mentioning.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `pairs.reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})` | Copies the accumulator every step: O(n²) for large inputs |
| `if (value)` before assigning | Drops `0`, `''`, `false` and `undefined` pairs, but the spec keeps the key |
| Using `Map` and returning it | The prompt asks for a plain object; `map.a` is `undefined` |
| Assuming keys keep their type | `fromPairs([[1, 'x']])` has key `'1'`, not `1` |

## Follow-ups interviewers ask

- **Round trip:** `fromPairs(Object.entries(obj))` gives a shallow copy of `obj`'s own enumerable string-keyed properties. It loses symbol keys, non-enumerable properties, getters (they're evaluated) and the prototype.
- **`Map` vs object:** use a `Map` when keys aren't strings, come from user input, or are added and removed frequently. Use an object when you need JSON serialisation or a fixed shape.
- **`toPairs` / `zipObject`:** the inverse (`Object.entries`) and the two-array variant (`zipObject(keys, values)`).
