Implement two functions for working with URL query strings, without using `URLSearchParams` or `URL`:

- `parse(query)` (default export) turns a query string into an object.
- `stringify(params)` (named export) turns an object back into a query string.

```js
parse('?q=react+hooks&tag=js&tag=ui&page=2&debug');
// { q: 'react hooks', tag: ['js', 'ui'], page: '2', debug: '' }

stringify({ q: 'react hooks', tag: ['js', 'ui'], page: 2, empty: undefined });
// 'q=react%20hooks&tag=js&tag=ui&page=2'
```

## `parse(query)`

- A leading `?` is ignored. An empty string gives `{}`.
- Pairs are separated by `&`. Empty segments (`a=1&&b=2`, a trailing `&`) are skipped.
- Each pair splits at the **first** `=`: `token=a=b` gives `{ token: 'a=b' }`. A pair without `=` has the value `''`.
- Keys and values are decoded: `+` becomes a space, then percent-escapes are decoded (`%20`, `%C3%A9`). If decoding fails (for example a lone `%`), keep that string as-is (after the `+` replacement) instead of throwing.
- A key that appears more than once produces an **array** of its values, in order. A key that appears once is a string.
- All values are strings; don't convert numbers or booleans.
- A key named `__proto__` must become a normal own property, not change the result's prototype.

## `stringify(params)`

- Iterate own enumerable keys in order.
- `undefined` and `null` values are skipped.
- An array value produces one `key=value` pair per element (an empty array produces nothing). `undefined`/`null` elements are skipped.
- Other values are converted with `String(value)`.
- Keys and values are encoded with `encodeURIComponent` (so spaces become `%20`).
- Pairs are joined with `&`, with no leading `?`.

`parse(stringify(obj))` must round-trip any object whose values are strings or non-empty arrays of strings.

## Follow-up

- Why can't you just use `decodeURIComponent` on the whole query string first and then split?
- Which conventions exist for arrays and nested objects in query strings (`a[]=1`, `a[0]=1`, `a=1,2`)?
- How would you keep filters in the URL in sync with React state?
