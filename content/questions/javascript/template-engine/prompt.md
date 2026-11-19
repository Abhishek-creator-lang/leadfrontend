Implement a small Mustache-style template engine.

- `compile(template)` (named export) parses the template **once** and returns a function `(data, options?) => string`.
- `render(template, data, options?)` (default export) is shorthand for `compile(template)(data, options)`.

```js
const greet = compile('<p>Hi {{ user.name | capitalize }}, you have {{count}} new {{ noun }}.</p>');

greet(
  { user: { name: 'ada' }, count: 0, noun: 'messages' },
  { filters: { capitalize: (s) => s[0].toUpperCase() + s.slice(1) } }
);
// '<p>Hi Ada, you have 0 new messages.</p>'

render('{{ html }} vs {{{ html }}}', { html: '<b>&</b>' });
// '&lt;b&gt;&amp;&lt;/b&gt; vs <b>&</b>'
```

## Syntax

| Tag | Meaning |
|---|---|
| `{{ expr }}` | Evaluate `expr`, convert to a string and **HTML-escape** it. |
| `{{{ expr }}}` | Same, but **not** escaped (raw HTML). |

Whitespace inside the braces is ignored: `{{name}}` and `{{   name   }}` are the same.

An `expr` is a **dotted path**, optionally followed by filters: `path | filterA | filterB`.

- Paths are resolved from `data`: `user.address.city`. If any step is `null` or `undefined`, the result is `undefined`.
- Each filter name refers to `options.filters[name]`, a function that receives the current value and returns a new one. Filters run left to right. An unknown filter throws an `Error` naming it.
- After filters, `null` and `undefined` render as `''`. Everything else uses `String(value)` (so `0` and `false` render as `"0"` and `"false"`).

## Escaping

`&` → `&amp;`, `<` → `&lt;`, `>` → `&gt;`, `"` → `&quot;`, `'` → `&#39;`.

## Requirements

- Text outside tags is copied unchanged.
- The compiled function can be called many times with different data.
- Never use `eval` or `new Function`.

## Follow-up

- Why is "escape by default, opt into raw" the right design?
- Escaping HTML is not enough inside an `href` or a `<script>`. Why not?
- How would you add `{{#each items}}...{{/each}}` blocks?
