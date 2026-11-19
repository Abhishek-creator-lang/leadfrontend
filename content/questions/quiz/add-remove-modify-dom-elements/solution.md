## TL;DR

**Create** elements with `document.createElement` (or clone a `<template>`), set their content with **`textContent`** and attributes/properties, then **insert** them with `append`, `prepend`, `before`, `after` or `replaceWith`. **Remove** with `element.remove()`. **Modify** via properties (`el.value`, `el.hidden`), `classList`, `dataset`, `setAttribute` and `style`. For many nodes, **batch** with a `DocumentFragment` or `replaceChildren`, and **avoid `innerHTML` with untrusted data** (XSS).

## Adding

```js
const list = document.querySelector('#todos');

function createTodo({ id, title, done }) {
  const li = document.createElement('li');
  li.dataset.id = id;                     // data-id="…"
  li.className = done ? 'todo done' : 'todo';
  const label = document.createElement('label');
  const checkbox = Object.assign(document.createElement('input'), { type: 'checkbox', checked: done });
  label.append(checkbox, ' ', title);     // strings become text nodes, so it's safe
  li.append(label);
  return li;
}

list.append(createTodo({ id: 1, title: 'Write docs', done: false }));
list.prepend(createTodo({ id: 0, title: 'Plan', done: true }));
```

Insertion methods (all accept several nodes or strings):

| Method | Inserts |
|---|---|
| `parent.append(...)` / `prepend(...)` | As last / first children |
| `el.before(...)` / `after(...)` | As siblings |
| `el.replaceWith(...)` | Replaces `el` |
| `parent.replaceChildren(...)` | Replaces all children (call with no args to clear) |
| `el.insertAdjacentElement/HTML/Text(pos, x)` | `beforebegin`, `afterbegin`, `beforeend`, `afterend` |

Older equivalents: `appendChild`, `insertBefore`, `replaceChild`, `removeChild`.

## Batching

```js
const frag = document.createDocumentFragment();
for (const todo of todos) frag.append(createTodo(todo));
list.replaceChildren(frag); // one insertion → one style/layout invalidation
```

Templates make repeated structures easy:

```html
<template id="todo-tpl"><li class="todo"><label><input type="checkbox"> <span></span></label></li></template>
```

```js
const tpl = document.querySelector('#todo-tpl');
const node = tpl.content.cloneNode(true);
node.querySelector('span').textContent = title;
list.append(node);
```

## Removing

```js
document.querySelector('[data-id="1"]')?.remove();
list.replaceChildren();          // remove all children
```

Removing a node also stops its listeners from firing, but **references held in JS keep it in memory** (detached DOM leak).

## Modifying

```js
const li = list.firstElementChild;
li.textContent = 'Renamed';                 // safe text
li.classList.toggle('done', true);          // add/remove/toggle/replace/contains
li.dataset.priority = 'high';               // data-priority
li.setAttribute('aria-checked', 'true');    // attributes as strings
li.hidden = true;                           // reflected boolean property
li.style.setProperty('--accent', 'tomato'); // inline styles / custom properties
input.value = 'x';                          // property: current value, not the attribute
```

Moving an existing node with `append` relocates it (a node can only be in one place). `moveBefore()` (Chromium 133+) moves while preserving state like focus and iframe contents.

## Security: `innerHTML`

```js
li.innerHTML = `<b>${userInput}</b>`; // ❌ XSS if userInput contains markup like <img onerror=…>
li.textContent = userInput;           // ✅
```

If you must insert HTML, sanitise it (DOMPurify, or the Sanitizer API `setHTML()` where supported) and consider **Trusted Types** to enforce this. `innerHTML` also destroys and recreates all descendants, losing listeners, focus and input state.

## Performance notes

- Batch writes; don't interleave them with layout reads (`offsetHeight`) in loops.
- For large lists, render only what's visible (virtualisation).
- Frameworks exist largely to do this diffing and batching for you. In React, you'd change state, not the DOM.

## In an interview, mention…

- The modern API set (`append`, `before`, `replaceWith`, `remove`, `replaceChildren`) and `classList`/`dataset`.
- `textContent` vs `innerHTML` and XSS, sanitisation and Trusted Types.
- Batching with fragments/templates, layout thrashing and detached-node leaks.
