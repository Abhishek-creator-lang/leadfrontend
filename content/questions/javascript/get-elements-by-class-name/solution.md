## Approach

1. **Parse the query once.** `classNames.trim().split(/\s+/)` turns `"  note \n warn "` into `['note', 'warn']`. If the trimmed string is empty, return `[]` immediately: `''.split(/\s+/)` gives `['']`, which would otherwise try to match an empty class.
2. **Walk the tree depth-first, pre-order.** Visit an element, then its children from first to last. That's exactly document order.
3. **Test each element** with `targets.every((c) => el.classList.contains(c))`. `classList` already tokenises the `class` attribute on whitespace, so whole-word matching comes for free.
4. **Skip `root`** by starting the walk at its children.

The reference solution uses an explicit stack instead of recursion. Push children in **reverse** so the first child is popped first, which keeps pre-order.

```js
const stack = [...root.children].reverse();
while (stack.length) {
  const el = stack.pop();
  if (matches(el)) result.push(el);
  for (let i = el.children.length - 1; i >= 0; i--) stack.push(el.children[i]);
}
```

`element.children` only contains element nodes, so text and comment nodes are skipped without a `nodeType` check.

## Complexity

O(N × K) time, where N is the number of descendants and K the number of requested classes (each `classList.contains` is effectively O(classes on the element)). O(depth + width) extra space for the stack, plus the result.

## Edge cases

- Whitespace-only query: return `[]`.
- Duplicate classes in the query (`"a a"`): still correct; you could dedupe with a `Set`.
- Elements with `class=""` or no `class` attribute: `classList` is empty, so they never match.
- SVG elements: `classList` works on them too. (`el.className` is an `SVGAnimatedString` on SVG, so string-splitting `className` is a subtle bug.)

## Common mistakes

| Mistake | Consequence |
|---|---|
| `el.className.includes('warn')` | Matches `warning`, and breaks on SVG |
| Including `root` in the result | The native method only searches descendants |
| Using `childNodes` without a type check | Calls `classList` on text nodes, which throws |
| Breadth-first traversal | Results come back out of document order |
| `''.split(' ')` without trimming | Matches against an empty class name |

## Live vs static collections

The native `getElementsByClassName` returns a **live** `HTMLCollection`: it updates automatically as the DOM changes. The classic bug:

```js
const items = document.getElementsByClassName('todo');
for (let i = 0; i < items.length; i++) items[i].classList.remove('todo'); // skips every other item
```

Removing the class removes the element from the collection, shifting indices. Our array (and `querySelectorAll`'s `NodeList`) is a static snapshot, which is usually what you want.

## Real-world connection

Browsers implement these lookups natively in C++ with caching, so in production you'd use `querySelectorAll('.note.warn')`. The interview is really about tree traversal, and the same walk shows up in React DevTools' component search, in testing libraries (Testing Library queries walk the DOM), and in virtual DOM diffing.

## Follow-ups

- **`TreeWalker`:** `document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT)` and repeated `nextNode()` gives a pre-order walk of descendants with no manual stack.
- **Recursion depth:** recursion is clearer, but a pathological 10,000-deep DOM could overflow the stack. The iterative version can't.
- **Support selectors:** extending this to `getElementsByTagName` or attribute matching only changes the predicate. Generalise to `findAll(root, predicate)`.
