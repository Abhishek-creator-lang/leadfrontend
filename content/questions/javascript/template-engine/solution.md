## Approach: compile to parts, then render

Separating **parsing** from **rendering** is the main design decision. Parsing the template string is the expensive part, and it's identical on every render, so `compile` does it once and returns a closure over the parsed result.

### 1. Tokenise with one regex

```js
const TAG = /\{\{\{\s*([\s\S]+?)\s*\}\}\}|\{\{\s*([\s\S]+?)\s*\}\}/g;
```

The **triple-brace alternative comes first**. Regex alternation tries alternatives left to right at each position, so `{{{ x }}}` is matched as raw before the double-brace branch can grab `{{{ x }}` and leave a stray `}`. The lazy `+?` stops at the first closing braces, so two tags on one line don't merge.

Walking `matchAll` results, the parts array alternates between literal strings (the text between matches) and tag objects:

```js
{ path: ['user', 'name'], filters: ['capitalize'], raw: false }
```

The expression is split on `|`, trimmed, and the path is split on `.` **at compile time**, so rendering does no string parsing at all.

### 2. Render

```js
return parts.map((part) => {
  if (typeof part === 'string') return part;
  let value = resolve(data, part.path);
  for (const name of part.filters) value = getFilter(name)(value);
  const text = value == null ? '' : String(value);
  return part.raw ? text : escapeHtml(text);
}).join('');
```

`resolve` walks the path and bails out with `undefined` as soon as it meets `null`/`undefined` (like optional chaining). Using `value == null` rather than a falsy check keeps `0` and `false`.

### Escaping

```js
s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
```

A single pass with a lookup can't double-escape, so there's no ordering issue as there is with chained `replace` calls. Quotes are escaped because templates often place values inside attributes: `<a title="{{ t }}">`.

## Complexity

Compile is O(T) for template length T. Each render is O(P + output), for P parts. Compilation is reused across renders, which is why real engines cache compiled templates by source string.

## Edge cases

- Missing data at any depth: `''`.
- `0`, `false`: rendered.
- Filters receiving `undefined`: they're user code; it's their job (or apply a `default` filter first).
- Unclosed `{{`: no match, so it's left as literal text. A stricter engine would throw.
- `}}` inside text: just text.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Double-brace regex before triple-brace | `{{{x}}}` renders as escaped value plus a stray `}` |
| Greedy `.+` in the tag regex | `{{a}} and {{b}}` captures `a}} and {{b` |
| `value || ''` | `0` disappears |
| Escaping before filters | Filters see `&amp;` instead of `&`, and escaping can be undone |
| Re-parsing the template on every render | Wasted work in lists |
| Building a JS function with `new Function` | Template text becomes executable code (that's how lodash's `_.template` works, and why it's unsafe with untrusted templates) |

## Security: context matters

HTML-escaping makes values safe in **text** and **quoted attributes**. It does not make them safe in:

- **URLs:** `href="{{ link }}"` with `javascript:alert(1)` contains no characters to escape. Validate the scheme (allow `http`, `https`, `mailto`).
- **`<script>` blocks or inline event handlers:** these need JavaScript-string escaping, not HTML escaping.
- **CSS:** `style="{{ css }}"` can still load URLs or break out of declarations.

Context-aware auto-escaping (Go's `html/template`, Angular's sanitiser, React's handling of `href` with `javascript:` URLs, which now warns and will block) handles this.

## Real-world connection

- **Handlebars / Mustache** use exactly this syntax: `{{ }}` escapes, `{{{ }}}` is raw. Handlebars compiles templates to functions and caches them.
- **Vue templates** use `{{ }}` interpolation, escaped by default; `v-html` is the raw escape hatch.
- **i18n libraries** (i18next, FormatJS) interpolate `{{name}}` or `{name}` placeholders into translated strings with escaping options.

## Follow-ups

- **Blocks:** parse `{{#each path}}`/`{{/each}}` into a tree (a stack of open blocks during parsing), render the body once per item with a child context.
- **Filter arguments:** `{{ price | currency:"EUR" }}`: parse arguments and pass them after the value.
- **Fallbacks:** `{{ name ?? "Anonymous" }}` or a `default` filter.
