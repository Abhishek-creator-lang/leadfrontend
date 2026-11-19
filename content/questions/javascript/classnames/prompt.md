Implement `classNames(...args)`, a function that joins CSS class names conditionally. It is modelled on the popular `classnames` / `clsx` packages, which React code uses everywhere:

```jsx
<button className={classNames('btn', { 'btn--active': isActive, 'btn--disabled': disabled }, size && `btn--${size}`)} />
```

```js
classNames('a', 'b');                      // 'a b'
classNames('a', { b: true, c: false });    // 'a b'
classNames({ 'is-open': 1, hidden: 0 });   // 'is-open'
classNames('a', ['b', ['c', { d: true }]]); // 'a b c d'
classNames(null, undefined, false, '', 0); // ''
classNames(1, 'x');                        // '1 x'
```

## Requirements

Each argument is handled by type:

| Argument | Result |
|---|---|
| Non-empty **string** | added as is |
| **Number** other than `0` and `NaN` | added (converted to a string) |
| **Array** | each item is processed recursively by these same rules, to any depth |
| **Plain object** | each **own enumerable** key whose value is **truthy** is added |
| Anything else (`null`, `undefined`, booleans, `''`, `0`, `NaN`, functions, symbols) | ignored |

- Class names are joined with a **single space**, in the order they are encountered. There is no leading or trailing whitespace.
- Duplicates are **not** removed: `classNames('a', 'a')` is `'a a'` (same as the `classnames` package).
- Inherited keys on objects are ignored.

## Follow-up

- How would you add de-duplication, and where would a later `{ a: false }` remove an earlier `'a'`?
- How would you avoid recursion for very deeply nested arrays?
- `clsx` is faster than `classnames`. What implementation choices make the difference?
