## Parsing

### Split first, decode last

```js
for (const segment of query.replace(/^\?/, '').split('&')) {
  if (!segment) continue;
  const eq = segment.indexOf('=');
  const rawKey = eq === -1 ? segment : segment.slice(0, eq);
  const rawValue = eq === -1 ? '' : segment.slice(eq + 1);
  add(result, decode(rawKey), decode(rawValue));
}
```

The order is the whole trick. Encoded delimiters must stay encoded until **after** splitting: `q=a%26b` means the value `a&b`. If you decoded the whole string first, it would become `q=a&b` and split into two pairs. The same applies to `%3D` (`=`) inside values, which is why we split on the **first** `=` only and decode each half separately.

### Decoding

```js
function decode(s) {
  const spaced = s.replace(/\+/g, ' ');
  try { return decodeURIComponent(spaced); } catch { return spaced; }
}
```

- **`+` means space** in `application/x-www-form-urlencoded`, the format HTML forms use for query strings. `decodeURIComponent` doesn't know that, so replace `+` first. A literal plus sign is sent as `%2B`, which decodes to `+` after the replacement, so the order is correct.
- **Malformed input** like `%` or `%E0%A4%A` makes `decodeURIComponent` throw a `URIError`. URLs come from users and other sites, so a parser must not crash on them. Fall back to the raw text.

### Repeated keys

The first occurrence stores a string; the second converts it to `[first, second]`; later ones push. Checking with `Object.prototype.hasOwnProperty.call` (not `result[key]`) avoids treating inherited properties like `toString` as existing values, and writing with `Object.defineProperty` (or using a null-prototype object) keeps `__proto__=...` from changing the result's prototype. Query strings are attacker-controlled input, so prototype pollution matters here.

## Stringifying

```js
const pairs = [];
for (const [key, value] of Object.entries(params)) {
  const values = Array.isArray(value) ? value : [value];
  for (const v of values) {
    if (v === undefined || v === null) continue;
    pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
  }
}
return pairs.join('&');
```

`encodeURIComponent` escapes everything that is meaningful in a query (`&`, `=`, `+`, `#`, `?`, space), which `encodeURI` does **not** (it leaves `&` and `=` alone because it's meant for whole URLs). Using `encodeURI` here is a classic bug: a value containing `&` breaks into two parameters.

`URLSearchParams.toString()` encodes spaces as `+` instead of `%20`. Both are valid in a query string, and our parser handles both.

## Complexity

O(n) in the length of the query string, for both directions.

## Edge cases

- `?`, `''`, `&&&`: `{}`.
- `a=`: `{ a: '' }`; `a`: `{ a: '' }`.
- `=value`: the key is `''`. Allowed, it's what browsers do.
- `a=1&a=2&a=3`: `['1', '2', '3']`.
- Unicode: `%F0%9F%98%80` decodes to an emoji; `stringify` encodes it back to the same bytes.
- Values that look like numbers stay strings. Type coercion belongs to the caller (or to a schema like Zod).

## Common mistakes

| Mistake | Consequence |
|---|---|
| Decoding before splitting | Encoded `&` and `=` in values corrupt the result |
| `segment.split('=')` | Values containing `=` (base64 tokens, JWTs) are truncated |
| Forgetting `+` | Form-submitted searches show `react+hooks` |
| Letting `decodeURIComponent` throw | One bad link crashes the page |
| `encodeURI` for values | `&` inside values splits parameters |
| `result[key] = value` | `__proto__` keys pollute prototypes |

## Real-world connection

- **`URLSearchParams`** is the built-in for this today; `new URLSearchParams(location.search).getAll('tag')` handles repeated keys, and it's what you'd use in production. The `qs` library (used by Express's `req.query`) supports nested syntax like `filter[status]=open` and has protections against prototype pollution and huge arrays.
- **URL as state:** filters, sort order, and pagination in the URL make views shareable and survive reloads. In React Router you'd use `useSearchParams`; in Next.js, `useSearchParams` plus `router.replace`, ideally debounced for text inputs so history isn't spammed.

## Follow-ups

- **Array conventions:** `tag[]=a&tag[]=b` (PHP/Rails), `tag=a,b` (comma-separated), or repeated keys. Pick one and document it; mixing them is a bug source.
- **Nested objects:** `filter[status]=open&filter[owner]=me` needs a bracket-path parser, plus depth limits.
- **Sorting keys** in `stringify` produces canonical URLs, which improves cache hit rates.
