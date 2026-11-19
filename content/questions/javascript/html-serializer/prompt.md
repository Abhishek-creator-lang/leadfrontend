Implement `serialize(node)`, which turns a tree of plain objects into a pretty-printed HTML string.

A node is either a **string** (a text node) or an **element** object:

```ts
type Node = string | {
  tag: string;
  attributes?: Record<string, string | number | boolean | null | undefined>;
  children?: Node[];
};
```

```js
serialize({
  tag: 'ul',
  attributes: { class: 'menu' },
  children: [
    { tag: 'li', children: ['Fish & chips'] },
    { tag: 'li', children: [{ tag: 'img', attributes: { src: 'pie.png', alt: '"Pie"' } }] },
    { tag: 'li' },
  ],
});
```

returns

```html
<ul class="menu">
  <li>
    Fish &amp; chips
  </li>
  <li>
    <img src="pie.png" alt="&quot;Pie&quot;">
  </li>
  <li></li>
</ul>
```

## Formatting rules

- Each opening tag, closing tag and text node goes on its **own line**, indented by **two spaces** per nesting level.
- An element with no children (missing or empty `children`) is written on one line: `<li></li>`.
- **Void elements** (`area`, `base`, `br`, `col`, `embed`, `hr`, `img`, `input`, `link`, `meta`, `source`, `track`, `wbr`) are written as just the opening tag, with no closing tag. Ignore any children they have.
- Lines are joined with `\n`, with no trailing newline.

## Escaping rules

- In text: `&` becomes `&amp;`, `<` becomes `&lt;`, `>` becomes `&gt;`.
- In attribute values (always wrapped in double quotes): `&` becomes `&amp;` and `"` becomes `&quot;`.
- Escape `&` **first**.

## Attributes

- Written in object key order, separated by single spaces: `<a href="/" title="Home">`.
- `true` writes just the name (`<input disabled>`). `false`, `null` and `undefined` omit the attribute. Numbers are converted to strings.

## Follow-up

- Why does escaping matter for security? Which XSS vector does this prevent?
- Where is the pretty-printing *not* safe? (Hint: `<pre>` and inline elements.)
- How would you stream the output instead of building one big string?
