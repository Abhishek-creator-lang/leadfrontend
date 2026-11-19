## Approach

Separate argument handling from generation.

**1. Normalise arguments**

```js
if (end === undefined) { end = start; start = 0; }
if (step === undefined) step = end < start ? -1 : 1;
```

As with `inRange`, a default parameter `start = 0` doesn't help: in `range(4)` the `4` arrives in `start`, so you must shift it into `end`.

**2. Compute the length up front**

`length = Math.max(Math.ceil((end - start) / (step || 1)), 0)`

- `ceil` makes the end exclusive and handles steps that don't divide evenly: `range(0, 10, 3)` has `ceil(10 / 3) = 4` elements, `[0, 3, 6, 9]`.
- A negative quotient (step pointing away from `end`) becomes `0`, so you get `[]` rather than an infinite loop.
- `step || 1` gives the zero-step behaviour from the spec.

**3. Fill by index**

`result[i] = start + i * step`. Computing from the index means `range(0, 1, 0.1)` produces `0.30000000000000004` only where a single multiplication does, instead of accumulating error on every step.

Knowing the length first is also what makes the function safe. A `while (current < end) current += step` loop needs separate conditions for negative steps, and it loops forever for a zero step or a step in the wrong direction.

## Complexity

O(n) time and space for n generated numbers.

## Edge cases

- `range(0)`: length 0, returns `[]`.
- `range(-4)`: default step is `-1`, giving `[0, -1, -2, -3]`.
- Step in the wrong direction: `[]`.
- Fractional steps: the last value never reaches `end`.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `while (i < end)` loop only | Wrong for negative steps, infinite for step `0` or a wrong-direction step |
| `current += step` accumulation | Floating error grows with each step |
| Default step always `1` | `range(5, 1)` returns `[]` instead of counting down |
| `Array(n).map(...)` | `map` skips holes, so you get an array of empty slots |

## Follow-ups interviewers ask

- **Generator:** `function* range(...)` yields values one at a time. That's O(1) memory and works for huge or open-ended ranges, and you can still spread it into an array when needed.
- **`Array.from`:** `Array.from({ length }, (_, i) => start + i * step)` is a neat one-liner once you have `length`. It works because `Array.from` visits every index of an array-like, unlike `map` on a sparse array.
- **`rangeRight`:** the same values in reverse order (a separate question).
