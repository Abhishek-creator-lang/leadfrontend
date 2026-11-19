Implement `size(collection)`. It returns how many items a collection holds. What counts as an "item" depends on the type.

```js
size([1, 2, 3]); // 3
size({ a: 1, b: 2 }); // 2
size('pebbles'); // 7
size('😀ok'); // 3   (code points, not UTF-16 units)
size(new Map([['a', 1]])); // 1
size(new Set([1, 2, 2])); // 2
size(null); // 0
size(42); // 0
```

## Rules

| Value | Size |
|---|---|
| `null`, `undefined` | `0` |
| strings | the number of **Unicode code points** (`'😀'.length` is `2`, but its size is `1`) |
| arrays, typed arrays, `arguments` objects | `length` |
| `Map`, `Set` | `size` |
| any other object, including functions and `Object.create(null)` objects | the number of **own enumerable string keys** |
| numbers, booleans, symbols, bigints | `0` |

## Follow-up

- `'👍🏽'` (thumbs up with a skin tone) has a size of 2 under these rules. What would a user call its length, and how would you count that?
- Why can't you use `.length` on a `Map`?
