Implement three string helpers **without** using `String.prototype.repeat`, `padStart` or `padEnd`. Export `repeat` as the default export and `padStart` / `padEnd` by name.

```js
import repeat, { padStart, padEnd } from './index';

repeat('ab', 3); // 'ababab'
repeat('x', 0); // ''

padStart('5', 3, '0'); // '005'
padStart('abc', 10, '123'); // '1231231abc'  (the filler is cut to fit)
padStart('abc', 6); // '   abc'      (default filler is a space)
padStart('abcdef', 3, '*'); // 'abcdef'   (already long enough)

padEnd('7', 4, '-'); // '7---'
padEnd('abc', 8, 'xy'); // 'abcxyxyx'
padEnd('abc', 6, ''); // 'abc'       (empty filler: nothing to pad with)
```

## Signatures

```js
repeat(str: string, count: number): string
padStart(str: string, targetLength: number, padString?: string): string
padEnd(str: string, targetLength: number, padString?: string): string
```

## Requirements

**`repeat`**

- Returns `str` concatenated `count` times. A non-integer `count` is truncated toward zero (`2.9` → `2`).
- Throws a `RangeError` if `count` is negative or `Infinity`.
- Should take O(log count) concatenations, not O(count).

**`padStart` / `padEnd`**

- If `str.length >= targetLength`, return `str` unchanged.
- `padString` defaults to `' '`. If it's an empty string, return `str` unchanged.
- Otherwise add exactly `targetLength - str.length` characters, made by repeating `padString` and **cutting off the end** of the filler if it doesn't fit evenly. `padStart` puts the filler before `str`, `padEnd` after it.

## Follow-up

- Why is the doubling trick in `repeat` faster than a loop, and does it still matter in modern engines?
- `'5'.padStart(3, '0')` is a common way to format times. What's the `Intl` alternative for formatting numbers with leading zeros?
