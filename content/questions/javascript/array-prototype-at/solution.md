## Approach

`at` is a thin wrapper around a property read. The real work is turning an arbitrary `index` argument into an integer, then mapping a negative integer to a position counted from the end.

1. Reject `null`/`undefined` receivers with a `TypeError`, then wrap the receiver with `Object(this)` so primitives such as strings get indexed properties and a `length`.
2. Read `length` and clamp it to a valid length (`ToLength` in the spec): a non-negative integer no larger than `Number.MAX_SAFE_INTEGER`.
3. Convert `index` with **ToIntegerOrInfinity**: `Number(index)`, map `NaN` to `0`, and truncate toward zero with `Math.trunc`.
4. If the integer is negative, add `length` to it.
5. If the result is outside `[0, length)`, return `undefined`. Otherwise return `O[k]`.

## Why not just `this[index < 0 ? len + index : index]`?

That shortcut fails on several inputs the native method handles:

| Input | Shortcut | Native `at` |
|---|---|---|
| `1.8` | reads property `"1.8"`, so `undefined` | truncates to `1` |
| `'2'` | `'2' < 0` is false, reads `"2"` (works by accident) | `2` |
| `undefined` / no argument | reads `"undefined"` | `0`, the first element |
| `-0.5` | `len + -0.5`, a non-integer key | truncates to `-0`, which is `0` |
| `-10` on a 3-element array | `this[-7]`, `undefined` (works by accident) | `undefined` |

Interviewers often probe exactly these cases, so show the coercion step explicitly.

## Complexity

O(1) time and space.

## Edge cases

- **Sparse arrays:** a hole is just a missing property, so `O[k]` is `undefined`. No special code is needed.
- **Array-likes and strings:** reading `length` and `O[k]` works for any object, which is why the method is generic. `Array.prototype.myAt.call('hey', -1)` returns `'y'`.
- **`Infinity` / `-Infinity`:** these stay infinite after `ToIntegerOrInfinity` and fall outside the range, so the result is `undefined`.
- **Symbols:** `Number(Symbol())` throws a `TypeError`, which is also what the native method does.

## Common mistakes

- Using `parseInt(index)`. It behaves differently for values like `1e21` or `'0x10'`, and `parseInt(undefined)` is `NaN`, which then needs handling anyway.
- Treating `this` as a real array and calling array methods on it, which breaks `Array.prototype.myAt.call(arrayLike)`.
- Defining the polyfill with an arrow function, which captures the wrong `this`.
- Adding an enumerable property to `Array.prototype` in production code. A real polyfill uses `Object.defineProperty(Array.prototype, 'at', { value, writable: true, configurable: true })` so it doesn't show up in `for...in` loops. It also checks whether the native method exists first.

## Follow-ups

- **Why `at` exists:** `arr[arr.length - 1]` needs the array twice, which is awkward when the array is the result of an expression (`getItems().at(-1)`). Bracket notation can't support negative indices because `arr[-1]` is a legitimate property lookup for the key `"-1"`.
- **Same pattern elsewhere:** `String.prototype.at`, `TypedArray.prototype.at`, and the relative `start`/`end` arguments of `slice`, `splice` and `fill` use the same "negative counts from the end" conversion.
