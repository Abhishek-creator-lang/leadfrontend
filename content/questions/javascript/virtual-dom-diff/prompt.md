Implement the **update** half of a virtual DOM library: given the previous virtual tree (already mounted) and a new one, change the real DOM so it matches the new tree, **reusing existing DOM nodes wherever possible**.

You get three functions to write:

```js
import patch, { h, mount } from './index';

const container = document.createElement('div');

let prev = h('ul', null,
  h('li', { key: 'a' }, 'Apple'),
  h('li', { key: 'b' }, 'Banana'),
  h('li', { key: 'c' }, 'Cherry'));
mount(prev, container);

const bananaLi = container.querySelectorAll('li')[1];

const next = h('ul', { className: 'fruits' },
  h('li', { key: 'c' }, 'Cherry'),
  h('li', { key: 'b' }, 'Banana!'),
  h('li', { key: 'd' }, 'Date'));
patch(prev, next);

// container.innerHTML:
// <ul class="fruits"><li>Cherry</li><li>Banana!</li><li>Date</li></ul>
container.querySelectorAll('li')[1] === bananaLi; // true: moved and updated, not recreated
```

## Virtual nodes

`h(type, props, ...children)` returns `{ type, props, key, children, el: null }`:

- `type` is a tag name string.
- `props` is `props ?? {}`; `key` is `props.key` (or `undefined`).
- `children` is flattened; `null`, `undefined` and booleans are dropped; strings and numbers become **text vnodes** `{ type: '#text', text: String(value), el: null }`.
- `el` will hold the vnode's real DOM node once mounted or patched.

## `mount(vnode, container)`

Creates the DOM for `vnode` (recursively, setting `el` on every vnode) and appends it to `container`. Returns the created DOM node.

## `patch(oldVNode, newVNode)` (default export)

`oldVNode` is mounted (its `el` is in the DOM). Update the DOM to match `newVNode`, set `newVNode.el` (and the `el` of every descendant), and return `newVNode.el`.

1. If the `type` or `key` differ, **replace** the old DOM node with a newly created one.
2. Text vnodes: reuse the text node and update its `nodeValue` if the text changed.
3. Elements: reuse the element, then update props and children.

### Props

- `key` is never written to the DOM. `className` maps to the `class` attribute.
- `on` + capital letter (`onClick`): an event listener for the lower-cased name. If the handler changes, remove the old listener and add the new one. If it's removed, remove the listener.
- `value` and `checked` are set as DOM properties.
- Anything else is an attribute: set it with `setAttribute(name, String(value))` when it's new or changed (`true` becomes `''`), and remove it when it's missing, `null`, `undefined` or `false` in the new props.

### Children

- A new child **with a key** reuses the old child with the same key, if its type matches.
- A new child **without a key** reuses the old child at the **same index**, if that old child is also unkeyed and has the same type.
- Matched children are patched recursively; unmatched new children are created; old children that weren't reused are removed from the DOM.
- Finally, the DOM children must appear in the new order. Move existing nodes rather than recreating them.

## Follow-up

- Why does using the array index as a key cause bugs when items are reordered or deleted?
- Your reordering step may move more nodes than necessary. How does the "longest increasing subsequence" trick (used by Vue 3 and Inferno) minimise moves?
- React assumes that different types produce different trees. What does that mean for component state?
