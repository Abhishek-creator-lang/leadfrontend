## Approach

1. If there are no arrays, return `[]`.
2. Turn every array **except the first** into a `Set`. Set lookups are O(1) on average and use SameValueZero, which is exactly the equality the prompt asks for.
3. Walk the first array. Keep a value if every other set `has` it **and** you haven't already added it. A separate `seen` set handles the second condition.

Walking the first array (rather than a set built from it) is what gives the required order: the first occurrence of each value in the first array.

```js
for (const value of first) {
  if (seen.has(value)) continue;
  if (others.every((set) => set.has(value))) { seen.add(value); result.push(value); }
}
```

## Complexity

Let n be the length of the first array, m the total length of the rest, and k the number of arrays.

- **Time:** O(m) to build the sets, plus O(n × k) membership checks. That's linear in the total input for a fixed number of arrays.
- **Space:** O(m) for the sets plus O(n) for `seen` and the result.

The naive version (`others.every((arr) => arr.includes(value))`) is O(n × m). It is still correct, because `includes` also uses SameValueZero. It's fine for tiny arrays, but say why you'd switch.

## Edge cases

- A single array returns its unique values.
- Any empty array makes the result `[]`.
- `NaN` intersects with `NaN`; `indexOf`-based solutions miss it.
- Two `{ id: 1 }` objects created separately don't intersect.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Checking membership with `indexOf` | `NaN` is never found |
| Forgetting to de-duplicate | `intersection([1, 1], [1])` returns `[1, 1]` |
| Counting occurrences across arrays (`count === arrays.length`) | Duplicates inside one array inflate the count and produce false positives |
| Calling `new Set(arr)` inside the per-value loop | O(n × m) work and lots of garbage |

## Follow-ups interviewers ask

- **Skewed sizes:** iterate the **smallest** array and build sets from the others, or sort the arrays by length and stop as soon as the running intersection is empty. If the result order must follow the first array, you can still filter the first array by the small candidate set at the end.
- **`intersectionBy`:** map each other array to a `Set` of `iteratee(value)` and test `iteratee(element)` from the first array. Return the elements from the first array, not the keys.
- **Native sets:** `Set.prototype.intersection` (ES2025) intersects two sets. It returns a `Set`, and its result order depends on which set is smaller, so it doesn't meet this prompt's ordering rule by itself.
- **Sorted input:** with sorted arrays, a two-pointer merge finds the intersection in O(n + m) with O(1) extra space.
