## TL;DR

Use **`URLSearchParams`**: `new URLSearchParams(location.search).get('q')`, or `new URL(location.href).searchParams`. It handles **decoding** (`%20`, `+` → space), **repeated keys** (`getAll`), missing keys (`null`) and iteration. Hand-rolled `split('&')` parsers are a common source of bugs.

## Reading

```js
// URL: /products?category=shoes&size=42&size=43&q=red+boots&sale
const params = new URLSearchParams(location.search);

params.get('category');  // 'shoes'
params.get('q');         // 'red boots'  (+ decoded as space)
params.get('missing');   // null
params.getAll('size');   // ['42', '43']
params.has('sale');      // true
params.get('sale');      // ''  (present but empty)

Object.fromEntries(params); // { category: 'shoes', size: '43', q: 'red boots', sale: '' }
// note: duplicate keys collapse to the last value

for (const [key, value] of params) console.log(key, value);
```

Values are always **strings**. Convert and validate explicitly:

```js
const page = Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1);
```

## Writing / updating

```js
const url = new URL(location.href);
url.searchParams.set('page', '2');
url.searchParams.append('size', '44');
url.searchParams.delete('sale');
url.searchParams.sort(); // stable ordering for caching / comparisons

history.replaceState(null, '', url); // update the address bar without reload
```

`url.searchParams.toString()` encodes values for you. Never build query strings by concatenation with raw user input.

## Gotchas

- **`location.search` vs hash routing**: with `#/page?x=1`, the query is inside `location.hash`, so `location.search` is empty. Parse `new URLSearchParams(location.hash.split('?')[1])`.
- **`+` vs `%20`**: `URLSearchParams` treats `+` as a space (form encoding). `decodeURIComponent` doesn't. If a value legitimately contains `+` (e.g. a phone number), the sender must encode it as `%2B`.
- **Booleans**: `?flag=false` is the string `'false'`, which is truthy.
- **Arrays**: conventions differ (`a=1&a=2`, `a[]=1`, `a=1,2`). Pick one with your backend; `getAll` supports the repeated-key style natively.
- **Security**: query values are attacker-controlled. Don't inject them into HTML (`innerHTML`), URLs you navigate to, or `eval`. Reflected DOM XSS often starts here.
- **SSR**: `location` doesn't exist on the server. Frameworks expose params instead (`useSearchParams` in React Router and Next.js, `searchParams` props in Next.js pages).

## Treat the URL as state

For filters, sorting and pagination, the query string should be the **source of truth**: it makes views shareable, bookmarkable and Back-button friendly. Read from the URL, render, and update with `replaceState` (typing) or `pushState` (deliberate navigation).

## In an interview, mention…

- `URLSearchParams` / `URL` and why they beat manual parsing.
- Values are strings; validate and coerce them.
- Hash-routing edge case and `+` decoding.
- URL-as-state for shareable UIs, and treating params as untrusted input.
