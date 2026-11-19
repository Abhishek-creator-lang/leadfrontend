## Approach

Clamping is "at least `lower`, at most `upper`", which maps directly onto `Math.max` and `Math.min`:

```js
Math.min(Math.max(number, lower), upper);
```

- `Math.max(number, lower)` lifts anything below the range up to `lower`.
- `Math.min(…, upper)` then pulls anything above the range down to `upper`.

`Math.max` and `Math.min` return `NaN` if any argument is `NaN`, so the `NaN` requirement holds without extra code. They also handle `±Infinity` correctly.

An explicit `if` chain works equally well and some interviewers prefer it for readability:

```js
if (number < lower) return lower;
if (number > upper) return upper;
return number;
```

Note that this version also returns `NaN` for `NaN` input, because both comparisons are `false`.

## Complexity

O(1) time and space.

## Edge cases

- Values exactly on a bound are returned unchanged.
- `NaN` in, `NaN` out. Silently converting it to a bound would hide bugs upstream.
- `-0` vs `0`: `Math.max(-0, 0)` is `0`, so `clamp(-0, 0, 5)` returns `+0`. This rarely matters, but it's a good sign if a candidate knows `Math.max` distinguishes them.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Swapping `min` and `max` (`Math.max(Math.min(n, lower), upper)`) | Always returns `upper` for a normal range |
| Exclusive comparisons with the wrong fallthrough | Values on the bound are moved, or the function returns `undefined` |
| Coercing inputs with `parseInt` | Truncates decimals: `clamp(2.5, 0, 5)` would become `2` |

## Follow-ups interviewers ask

- **`lower > upper`:** the result depends on the order the bounds are applied in. `Math.min(Math.max(n, lower), upper)` always returns `upper`; lodash applies `upper` first and `lower` second, so it always returns `lower`. Neither is "right", which is exactly why it's worth defining. Alternatives are swapping the bounds or throwing a `RangeError`. In a library, throwing in development and being lenient in production is a reasonable middle ground.
- **Optional lower bound:** lodash allows `clamp(number, upper)`. Supporting it means checking `arguments.length` (or `upper === undefined`) and shifting the arguments.
- **CSS `clamp()`:** CSS takes `clamp(MIN, VAL, MAX)` and, unlike our function, resolves `MIN > MAX` in favour of `MIN`.
