## Approach

### `repeat`: exponentiation by squaring

Repeating a string n times is like computing a power. Look at the bits of `count`:

```js
let result = '';
let chunk = str;
while (n > 0) {
  if (n & 1) result += chunk; // this bit is set: include the current chunk
  n = Math.floor(n / 2);
  if (n > 0) chunk += chunk;   // double the chunk for the next bit
}
```

For `count = 5` (binary `101`), the result is `str` + `str×4`: three concatenations instead of five. In general it's O(log count) concatenations. Use `Math.floor(n / 2)` rather than `n >>= 1`, because bit operators truncate to 32 bits and would break for counts above 2³¹ (which would produce an enormous string anyway, but correctness first).

Validation comes first: truncate with `Math.trunc`, then throw `RangeError` for negative or infinite counts, which is what the built-in does. `repeat('', 1e9)` is legal and cheap.

### `padStart` / `padEnd`: build the filler once

1. `const fillLength = targetLength - str.length`. If it's `<= 0`, or `padString` is `''`, return `str`.
2. Make the filler: repeat `padString` enough times to cover `fillLength`, `Math.ceil(fillLength / padString.length)`, then `slice(0, fillLength)` to cut off the excess **from the end**.
3. Prepend or append.

Both pad functions share step 1 and 2, so the reference solution has a `makeFiller` helper and each public function is one line. Building the filler with `repeat` reuses the logarithmic version.

## Complexity

- `repeat`: O(log count) concatenations; the output itself is O(count × len).
- `padStart` / `padEnd`: O(targetLength).

## Edge cases

- `repeat(str, 0)` is `''`; `repeat('', n)` is `''`.
- `repeat('a', 2.9)` is `'aa'`.
- `padStart('abc', 10, '123')` is `'1231231abc'`: the filler `'1231231'` is cut from `'123123123'`, keeping the **start** of the pattern.
- A `targetLength` shorter than the string never truncates the string.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Looping `count` times with `+=` | Correct but O(count) concatenations |
| `while (n--)` with a negative count | Infinite loop instead of `RangeError` |
| Cutting the filler from the front (`slice(-fillLength)`) | `'3123123abc'` instead of `'1231231abc'` |
| Not handling an empty `padString` | `Math.ceil(x / 0)` is `Infinity`, which makes `repeat` throw |
| Padding when the string is already long enough, or truncating it | Changes the input when it should be returned as-is |

## Does the doubling trick still matter?

Modern engines represent `+=` concatenations as ropes, so even the naive loop isn't quadratic. The doubling version still does far fewer operations, and it's what spec-compliant polyfills use. In an interview, the point is showing you can spot the O(log n) structure, then being honest that the built-in is what you'd use in production.

## Follow-ups interviewers ask

- **Number formatting:** `new Intl.NumberFormat('en', { minimumIntegerDigits: 2 }).format(5)` gives `'05'`, and handles locales. For clock times, `Intl.DateTimeFormat` with `hour: '2-digit'` is better still.
- **Unicode:** `padString` and `targetLength` count UTF-16 code units, so padding with an emoji can cut a surrogate pair in half. Discuss using code points or graphemes if the filler isn't ASCII.
- **Generalise:** `pad(str, length, chars)` centred on both sides, which is lodash's `pad`: put `floor(extra / 2)` on the left and the rest on the right.
