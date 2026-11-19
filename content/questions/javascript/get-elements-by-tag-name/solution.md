## Approach

Normalise the target once (`tagName.toLowerCase()`), then do a recursive pre-order traversal starting from `root`'s children:

```js
function visit(el) {
  if (matchAll || el.tagName.toLowerCase() === target) result.push(el);
  for (const child of el.children) visit(child);
}
for (const child of root.children) visit(child);
```

- **Pre-order** (check the node, then recurse into its children from left to right) produces document order, the same order the HTML source lists elements.
- **`children`** contains only element nodes, so text and comments are skipped automatically. If you use `childNodes`, filter on `node.nodeType === Node.ELEMENT_NODE`.
- **Starting from the children** keeps `root` out of the result, as the native method does.

`el.tagName` for HTML elements in an HTML document is upper-case (`'DIV'`), so compare lower-cased strings. Lower-casing the target once outside the loop avoids repeating it per node.

## Complexity

O(N) time for N descendants (each comparison is O(tag length), effectively constant). O(H) call-stack space for a tree of height H, plus the result array.

## Recursive or iterative?

The recursive version is the clearest. Its only risk is stack depth: each nesting level adds a frame, and engines allow roughly 10,000 frames, so a real page is never a problem, but a generated, pathologically deep tree could be. An explicit stack (see *getElementsByClassName*) removes that limit at a small cost to readability. In an interview, write the recursive one and mention the trade-off.

## Edge cases

- `'*'`: matches every element.
- Mixed case input: handled by lower-casing both sides.
- Elements nested inside matching elements (`<div><div></div></div>`): both are returned, outer first.
- No match: `[]`.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Comparing `el.tagName === 'div'` | Never matches; HTML `tagName` is upper-case |
| Using `el.nodeName` on `childNodes` without a type check | Text nodes have `nodeName` `'#text'`; harmless here, but comments and text pollute other predicates |
| Recursing before checking the current node | Post-order: children come before parents |
| Including `root` | Differs from the native API |

## The SVG nuance

`tagName` is the element's **qualified name**, upper-cased only for HTML-namespace elements in HTML documents. SVG elements keep their case (`foreignObject`, `linearGradient`). The native method handles this by matching HTML elements case-insensitively but other namespaces exactly. Mention it to show you know where naive lower-casing breaks. `localName` is the more predictable property to compare.

## Live collections

The native method returns a live `HTMLCollection`. Browsers make it cheap with caching, invalidated on DOM mutation. Building one yourself would need a `MutationObserver` or recomputing on every access. Static arrays avoid the "collection changes while I iterate over it" class of bugs, which is why `querySelectorAll` returns a static `NodeList`.

## Real-world connection

The same traversal powers accessibility tree builders, `innerText` computation, HTML sanitisers (walk the tree and drop disallowed tags such as `script`), and test utilities like Testing Library's `getAllByRole`, which walks the DOM and checks each element's role.

## Follow-ups

- Support `getElementsByTagNameNS(namespace, localName)`.
- Generalise to `findAll(root, predicate)` and implement both this and class-name lookup on top of it.
- Stop early: `findFirst` returns as soon as it finds a match, like `querySelector`.
