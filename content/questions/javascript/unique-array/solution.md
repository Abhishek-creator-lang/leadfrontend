## Approach

Keep a `Set` of values already seen. Walk the array once; when a value isn't in the set, add it to the set and push it to the result.

```js
const seen = new Set();
for (const value of array) {
  if (!seen.has(value)) { seen.add(value); result.push(value); }
}
```

`Set` uses SameValueZero, which matches every requirement: `NaN` is found, `0` and `-0` are the same, no coercion, objects by reference. Iterating the input (rather than returning `[...seen]`) makes the "first occurrence order" explicit, though `Array.from(new Set(array))` gives the same result because sets preserve insertion order. In an interview, show the one-liner and explain *why* it's correct.

## Complexity

- **Time:** O(n) on average (hash lookups).
- **Space:** O(u) for u unique values, plus the result.

## Edge cases

- `NaN`: `indexOf`-based solutions keep every `NaN` because `NaN !== NaN`.
- `0` and `-0` collapse into one value; the first one seen is kept.
- `1` and `'1'` stay separate. Using a plain object as the lookup (`seen[value] = true`) would wrongly merge them, along with `true` and `'true'`, and every object (they all become `'[object Object]'`).
- Empty array returns `[]`.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `array.filter((v, i) => array.indexOf(v) === i)` | O(n²), and drops **every** `NaN` (`indexOf(NaN)` is `-1`, never `i`) |
| Plain-object lookup | Coerces keys to strings: `1` and `'1'` merge, all objects merge |
| `array.sort()` then remove neighbours | Changes the order and mutates the input |
| `JSON.stringify` to compare objects | Turns a reference check into a (slow, order-sensitive) structural check the spec doesn't ask for |

## Without `Set`, `Map` or objects (the reported variant)

Reddit has been reported to ask for this with those data structures off the table. The honest answer is a nested scan:

```js
for (const value of array) {
  let found = false;
  for (const kept of result) {
    if (kept === value || (kept !== kept && value !== value)) { found = true; break; }
  }
  if (!found) result.push(value);
}
```

That's O(n × u) time and O(1) extra space beyond the result. `includes` does the same check (and handles `NaN`), but interviewers who ban `Set` often ban that too, so be ready to write the loop. Then discuss: sorting a copy first gives O(n log n), but loses the original order unless you sort indices.

## Follow-ups interviewers ask

- **Sorted input:** compare each element with the last one kept; O(n) time, O(1) extra space, and it can be done in place.
- **Unique by key, last wins:** use a `Map` from key to element, overwriting as you go; then `[...map.values()]`. Note that the order then follows each key's *first* insertion. If you need last-occurrence order, delete and re-insert the key.
- **Large arrays in a UI:** de-duplicate once when data arrives (for example in a reducer or selector), not on every render.
