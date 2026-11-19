## Approach

Walk the array in steps of `size` and take a `slice` at each step:

1. Normalise `size` with `Math.floor`. If it's below `1`, return `[]` straight away. Without this guard a size of `0` makes the loop step by zero and never finish.
2. For `i = 0, size, 2 * size, …` push `array.slice(i, i + size)`.
3. `slice` clamps its end index to the array length, so the last, shorter chunk needs no special case.

`slice` always returns a new array and never touches the original, so the input stays unchanged.

## Complexity

- **Time:** O(n). Every element is copied exactly once.
- **Space:** O(n) for the output (plus O(n / size) for the outer array).

## Edge cases

- Empty input returns `[]`, not `[[]]`.
- `size` larger than the length gives a single chunk containing everything.
- `size` of `0`, a negative number, or `0.5` returns `[]`.
- Holes and `undefined` values are copied like any other element.

## Common mistakes

| Mistake | Consequence |
|---|---|
| No guard for `size < 1` | `i += 0` is an infinite loop and hangs the tab |
| Using `splice` on the input | Empties the caller's array as a side effect |
| Building chunks with a `current` buffer and forgetting to push the last one | The final partial chunk is lost |
| Returning `[[]]` for empty input | Callers that iterate chunks send one empty request |

An alternative is a single loop with a buffer: push each element into `current`, and when `current.length === size` push it to the result and start a new buffer. It's equally O(n), but you must remember to flush the last buffer, which is a classic off-by-one bug. The `slice` version avoids it.

## Follow-ups interviewers ask

- **Iterables and generators:** a generator `function* chunk(iterable, size)` that yields each chunk as soon as it's full works with streams and infinite sequences, and keeps memory at O(size).
- **Batched requests:** `chunk(ids, 50)` followed by a concurrency-limited runner (see the async pool questions) avoids firing hundreds of requests at once.
- **Typed arrays:** `subarray` gives views without copying, which matters for large binary buffers.
