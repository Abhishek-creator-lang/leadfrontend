## TL;DR

JSX is a **syntax extension that lets you write HTML-like markup inside JavaScript**. It isn't valid JS, so a compiler (Babel, TypeScript, SWC, esbuild) turns each tag into a **function call that creates a React element**. With the modern "automatic runtime" (React 17+), `<div className="x">hi</div>` becomes `jsx('div', { className: 'x', children: 'hi' })`, imported from `react/jsx-runtime`. You no longer need `import React` in every file.

## How the transform works

```jsx
// Source
function App({ user }) {
  return (
    <Card title="Profile">
      <Avatar src={user.photo} />
      <p>{user.name}</p>
    </Card>
  );
}
```

```js
// Output (automatic runtime, simplified)
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';

function App({ user }) {
  return _jsxs(Card, {
    title: 'Profile',
    children: [
      _jsx(Avatar, { src: user.photo }),
      _jsx('p', { children: user.name }),
    ],
  });
}
```

Rules that fall out of this:

- **Lowercase tags are host elements** (`'div'` as a string) and **capitalized tags are variables** (`Card`). `<card>` would look for an HTML element called `card`.
- **`{}` embeds any JavaScript expression**, but not statements. Use ternaries, `&&`, or `.map()` instead of `if`/`for` inside JSX.
- **One root per expression.** A component returns one value, so wrap siblings in a Fragment (`<>…</>`).
- **Attributes are props** in camelCase (`className`, `htmlFor`, `onClick`, `tabIndex`). `style` takes an object.
- **`key` is special.** It's extracted by the runtime and isn't readable as a prop. Since React 19, `ref` is an ordinary prop on function components.
- **Text is escaped.** `{userInput}` is inserted as text, which protects you from XSS by default. `dangerouslySetInnerHTML` is the explicit escape hatch.

## Classic vs automatic runtime

| | Classic | Automatic |
|---|---|---|
| Output | `React.createElement(type, props, ...children)` | `jsx(type, props, key)` |
| Needs `React` in scope | Yes | No |
| Config | `"jsx": "react"` in tsconfig | `"jsx": "react-jsx"` |

The automatic runtime also enables dev-only metadata (source location) and is required for some React 19 features. Almost all toolchains default to it now.

## Pitfalls

- `{count && <Badge />}` renders `0` when `count` is 0. Coerce to a boolean.
- `{/* comments */}` need braces inside JSX.
- Use `className`/`htmlFor`. `class`/`for` trigger a dev warning on DOM elements.
- JSX is **not HTML**: self-closing tags need `/>`, and boolean attributes need `{true}` or just the name (`disabled`).
- JSX doesn't create DOM nodes, only element descriptions. Nothing renders until React reconciles them.

## Beyond React

JSX is framework-agnostic. Preact, Solid, Vue (optionally) and others use it with a different `jsxImportSource`. Solid even compiles it to real DOM operations instead of element objects. That's a good example of JSX being syntax, not runtime.

## In an interview, mention…

- JSX is syntactic sugar compiled to element-creating calls. Browsers never see it.
- The difference between the classic and automatic runtimes, and why `import React` is no longer needed.
- Automatic escaping is a security benefit, and `dangerouslySetInnerHTML` is the deliberate opt-out.
- Expressions only, capitalized component names, and keys/refs as special props.
