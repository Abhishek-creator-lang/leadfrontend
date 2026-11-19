## Approach

Loop over the array and keep each element whose boolean coercion is `true`. `if (value)` applies exactly the same `ToBoolean` rules the language uses everywhere, so the list of falsy values in the prompt comes for free. You don't need to (and shouldn't) list them by hand.

The idiomatic one-liner is `array.filter(Boolean)`. `filter` calls `Boolean(element, index, array)`. `Boolean` ignores the extra arguments and returns the coerced value. The reference solution spells the loop out so the coercion is explicit, but in an interview it's worth showing both.

## Complexity

O(n) time and O(n) space in the worst case (nothing removed).

## Edge cases

- `NaN` is falsy, so it's removed, even though `NaN === NaN` is false. Hand-written checks like `value !== 0` miss this.
- `document.all` is falsy in browsers for legacy reasons, so it's removed too. This is a nice trivia point, not something to test.
- Empty arrays and objects are **truthy** and kept.
- Sparse arrays: `filter` skips holes, so they disappear from the result. A plain `for` loop sees holes as `undefined`, which is falsy, so they're removed either way.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Hand-coding a list like `[null, undefined, 0, '', false]` with `includes` | `includes` does find `NaN`, but the list is easy to get incomplete (`-0` is matched by `0`, `0n` is not) |
| `value != null` | Keeps `0`, `''`, `false` and `NaN` (that's a different utility) |
| Mutating with `splice` while looping forward | Skips the element after each removal |

## When `compact` is the wrong tool

Removing every falsy value is lossy: a list of quantities `[0, 3, 0]` becomes `[3]`. In real code a `isNonNullable` filter (`value !== null && value !== undefined`) is often safer. In TypeScript it can also narrow the type: `arr.filter((v): v is T => v != null)`.

## Follow-ups interviewers ask

- **Objects:** "compact" an object by removing keys whose value is falsy (`Object.fromEntries(Object.entries(obj).filter(([, v]) => v))`).
- **Deep compact:** recurse into nested arrays and objects. Decide whether an object that becomes empty should itself be removed.
