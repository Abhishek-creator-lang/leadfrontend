Implement `listFormat(items, options)`, which turns an array of strings into a human-readable English list. Think of "Liked by Ana, Ben and 3 others" under a post.

```js
listFormat([]); // ''
listFormat(['Ana']); // 'Ana'
listFormat(['Ana', 'Ben']); // 'Ana and Ben'
listFormat(['Ana', 'Ben', 'Cy']); // 'Ana, Ben and Cy'

listFormat(['Ana', 'Ben', 'Cy', 'Dee', 'Eli'], { length: 3 });
// 'Ana, Ben, Cy and 2 others'
listFormat(['Ana', 'Ben', 'Cy'], { length: 2 });
// 'Ana, Ben and 1 other'

listFormat(['Cy', 'Ana', 'Ben'], { sorted: true }); // 'Ana, Ben and Cy'
listFormat(['Ana', 'Ben', 'Ana'], { unique: true }); // 'Ana and Ben'
listFormat(['Ana', '', 'Ben']); // 'Ana and Ben'
```

## Signature

```js
listFormat(items: string[], options?: { sorted?: boolean; length?: number; unique?: boolean }): string
```

## Requirements

- **Empty strings** are ignored completely (they're not counted anywhere).
- Items are joined with `', '`, and the last two with `' and '`. No Oxford comma.
- Options are applied in this order:
  1. `unique: true` removes duplicates, keeping the first occurrence.
  2. `sorted: true` sorts alphabetically with the default `sort()` order (by UTF-16 code units).
  3. `length: n` shows only the first `n` items, followed by `' and N others'`, or `' and 1 other'` when exactly one is hidden.
- `length` is ignored if it's not a positive number or if it's greater than or equal to the number of items.
- Don't mutate the input array.

## Follow-up

- What does `Intl.ListFormat` give you, and what doesn't it handle from this spec?
- How would you localise "1 other / N others" for languages with more than two plural forms?
- `sort()` puts `'bob'` after `'Zed'`. How would you sort the way a user expects?
