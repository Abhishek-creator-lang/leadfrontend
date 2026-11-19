## Approach

### `h`: normalise once, at creation

```js
export function h(type, props, ...children) {
  return { type, props: props ?? {}, children: normalizeChildren(children) };
}
```

`normalizeChildren` uses `children.flat(Infinity)`, then removes `null`, `undefined` and booleans, and stringifies numbers. Doing this in `h` means `render` (and later the diff algorithm) only ever sees strings and vnodes.

Why remove booleans? So conditional rendering works: `{isOpen && <Menu />}` evaluates to `false` when closed. Why keep `0`? Because `0` is real content, which is also why `{items.length && <List />}` famously renders a stray "0" in React.

### `render`: recursion over three cases

```js
export default function render(vnode) {
  if (typeof vnode === 'string' || typeof vnode === 'number') return document.createTextNode(String(vnode));
  if (typeof vnode.type === 'function') return render(vnode.type({ ...vnode.props, children: vnode.children }));
  const el = document.createElement(vnode.type);
  for (const [name, value] of Object.entries(vnode.props)) setProp(el, name, value);
  for (const child of vnode.children) el.appendChild(render(child));
  return el;
}
```

- **Text nodes via `createTextNode`.** Text is never interpreted as HTML, so user content like `<img onerror=...>` is displayed, not executed. This is the reason React is XSS-safe by default, and why `innerHTML` is the dangerous escape hatch.
- **Function components** are just functions from props to vnodes. `children` is passed in props, which is how `props.children` works in React.

### `setProp`: the rules table

The order of checks matters:

1. `key` and `children`: skip.
2. `false`/`null`/`undefined`: skip (absent attribute).
3. `on[A-Z]...` with a function: `addEventListener(name.slice(2).toLowerCase(), value)`.
4. `style` object: `setProperty` for keys containing `-` (kebab-case and custom properties `--x`), direct assignment for camelCase.
5. `value`/`checked`: properties.
6. `className`/`htmlFor`: mapped to `class`/`for`, since `class` and `for` are reserved words in JavaScript (that's why JSX uses those names).
7. `true`: empty attribute; otherwise `setAttribute(name, String(value))`.

### Attributes vs properties

For form controls, the attribute is the **default** and the property is the **current state**. `setAttribute('value', 'x')` changes the default; after the user has typed, it doesn't change what's displayed. `checked` is similar. Setting the properties is what makes "controlled inputs" work.

## Complexity

O(n) for n vnodes: each is created once and appended once. Building the subtree **before** inserting it into the document means the browser does one layout for the whole tree rather than one per node, a reason to render off-document.

## Edge cases

- Deeply nested arrays of children: `flat(Infinity)`.
- Number children like `0`: rendered as `"0"`.
- Components returning strings: handled by the recursive call.
- `style` values that are numbers: here they're assigned as-is (`el.style.opacity = 0.5` works; `width = 10` is invalid and ignored). React appends `px` for non-unitless properties; see *jQuery CSS*.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `el.innerHTML = text` for text children | XSS |
| `setAttribute('onClick', fn)` | Sets the string `"function () {...}"` as an inline handler; nothing useful happens |
| `setAttribute('class', ...)` for `className` but forgetting `htmlFor` | Labels aren't associated with inputs, breaking a11y |
| Keeping `false` children | Renders the text "false" |
| Setting `value` as an attribute | Input value doesn't update after user edits |

## Real-world connection

- **React's `createElement`** returns `{ $$typeof, type, key, ref, props }`, with children inside `props`. The `$$typeof: Symbol.for('react.element')` field is a security measure: JSON from a server can't contain symbols, so injected objects can't masquerade as elements.
- **Preact** and **hyperscript** use a very similar `h` function. Vue's render functions call it `h` too.
- React DOM attaches **one** listener per event type at the root and dispatches synthetically, rather than `addEventListener` per element, which is cheaper and supports re-rendering without re-binding. That's a good follow-up discussion.

## Follow-ups

- **Fragments:** a special `Fragment` type whose render returns a `DocumentFragment` containing the rendered children.
- **Diffing and patching:** keep the vnode tree and update the DOM minimally on the next render. See *Virtual DOM Diff*.
- **SVG:** use `document.createElementNS('http://www.w3.org/2000/svg', type)` inside `<svg>`, and pass the namespace down the recursion.
- **Refs:** call `props.ref(el)` after creating the element.
