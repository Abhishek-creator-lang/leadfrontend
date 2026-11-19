## Approach

The task reduces to one question: **where does the kept part start?**

1. Walk forward with an index while `index < array.length` and `predicate(array[index], index, array)` is truthy.
2. The first index where the predicate fails is the start of the result. Return `array.slice(index)`.

If every element passes, the index ends at `array.length` and `slice` returns `[]`. If the first element fails, the index is `0` and you get a full copy. No special cases needed.

The loop stops on the first failure, which matters for two reasons. It's the specified behaviour (later matching elements are kept), and it means the predicate is called the minimum number of times. That's relevant if the predicate is expensive or has side effects.

## Complexity

- **Time:** O(k) predicate calls, where k is the number of dropped elements plus one, then O(n − k) to copy the rest. O(n) overall.
- **Space:** O(n − k) for the result.

## Edge cases

- Empty array: the predicate is never called and `[]` is returned.
- Predicate always truthy: returns `[]`.
- Predicate always falsy: returns a copy (not the same reference).
- The predicate receives `index` and `array`, so it can compare neighbours.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Using `filter((v) => !predicate(v))` | Also removes matching elements later in the array |
| Using `findIndex` and forgetting the "not found" case | `findIndex` returns `-1`, and `slice(-1)` returns the **last** element instead of `[]` |
| Using `shift()` in a loop on the input | Mutates the caller's array, and `shift` is O(n) per call |
| Continuing to call the predicate after it fails | Wasted work and surprising side effects |

The `findIndex` version is fine if you handle `-1`:

```js
const start = array.findIndex((v, i, a) => !predicate(v, i, a));
return start === -1 ? [] : array.slice(start);
```

## Follow-ups interviewers ask

- **`takeWhile`:** same scan, but return `array.slice(0, index)`.
- **Iterators:** for a lazy version over an iterable, skip values until the first failure, then yield everything. The ES2025 iterator helpers include `Iterator.prototype.drop(n)` but not a `dropWhile`.
- **`dropRightWhile`:** scan from the end instead (a separate question in this set).
