JSX compiles to function calls like `h('button', { onClick }, 'Save')` (React's `createElement`). Implement both halves of that pipeline:

1. `h(type, props, ...children)` (named export) returns a **virtual node**, a plain object describing the element.
2. `render(vnode)` (default export) turns a virtual node into a **real DOM node**.

```js
function Badge({ count, children }) {
  return h('span', { className: 'badge' }, children, ': ', count);
}

const vnode = h(
  'div',
  { id: 'app', style: { padding: '8px', backgroundColor: 'white' } },
  h('h1', null, 'Inbox'),
  h(Badge, { count: 3 }, 'Unread'),
  false && h('p', null, 'hidden'),
  h('button', { onClick: () => alert('hi'), disabled: true }, 'Refresh')
);

document.body.appendChild(render(vnode));
// <div id="app" style="padding: 8px; background-color: white;">
//   <h1>Inbox</h1><span class="badge">Unread: 3</span><button disabled="">Refresh</button>
// </div>
```

## `h(type, props, ...children)`

Returns `{ type, props, children }` where:

- `props` is `props ?? {}`.
- `children` is **flattened** to any depth (so `h('ul', null, items.map(...))` works), with `null`, `undefined`, `true` and `false` removed. Numbers are converted to strings. Everything else (strings and vnodes) is kept as-is.

## `render(vnode)`

- A **string** (or number) becomes a text node. Text is never parsed as HTML.
- If `type` is a **function**, call it with `{ ...props, children }` and render whatever it returns.
- Otherwise, create an element with `document.createElement(type)`, apply the props, then append each rendered child in order.

### Props

| Prop | Applied as |
|---|---|
| `className` | The `class` attribute |
| `htmlFor` | The `for` attribute |
| `style` (object) | Each entry: camelCase keys set via `el.style[key]`, keys containing `-` via `el.style.setProperty(key, value)` |
| `on` + capital letter, function value (`onClick`, `onKeyDown`) | `addEventListener` with the lower-cased event name (`click`, `keydown`) |
| `value`, `checked` | Set as DOM **properties** (`el.value = ...`) |
| `key` | Ignored (used only for diffing) |
| `true` | Attribute with an empty value (`disabled=""`) |
| `false`, `null`, `undefined` | Skipped |
| Anything else | `setAttribute(name, String(value))` |

## Follow-up

- Why does JSX need a `key` prop for lists if `render` ignores it?
- Why are `value` and `checked` set as properties instead of attributes?
- How would you add support for fragments?
