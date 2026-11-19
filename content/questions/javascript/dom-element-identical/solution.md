## Approach

Compare the two nodes, then recurse into their children pairwise. Fail as early as possible: cheap checks first.

1. `a === b` means trivially identical.
2. Different `nodeType`: not identical.
3. **Text / comment / CDATA nodes:** compare `nodeValue` and stop (they have no children).
4. **Elements:**
   - Compare `tagName` (or `namespaceURI` + `localName` to be namespace-safe).
   - Compare attributes: same count, and for every attribute on `a`, `b.getAttribute(name)` returns the same value. Equal counts plus "every attribute of `a` matches in `b`" proves the sets are equal, regardless of order.
5. Compare `childNodes.length`, then each child pair recursively, in order.

The reference solution uses an explicit stack of `[a, b]` pairs rather than recursion, so very deep trees can't overflow the call stack. Pairs are checked as they're popped; any mismatch returns `false` immediately.

## Complexity

O(N + total attributes) time, where N is the number of nodes in the smaller tree (we stop at the first difference). O(H) stack space for recursion, or O(width) for the explicit stack.

## Why not compare `outerHTML`?

- **Attribute order:** `<p id="1" class="x">` and `<p class="x" id="1">` serialise differently but are equal by our definition (and by `isEqualNode`).
- **Cost:** serialising both trees allocates two strings proportional to the whole tree and can't stop early.
- **Properties aren't attributes:** neither approach sees `input.value` or `checked` after user interaction, because those are properties, not attributes. Worth saying out loud.

## Edge cases

- Whitespace text nodes count: `<p>a</p>` vs `<p> a</p>` are different.
- Empty elements: `childNodes.length === 0` on both sides.
- Attributes with empty values (`<input disabled>` has `disabled=""`): `getAttribute` returns `''`, while a missing attribute returns `null`, so they compare correctly.
- Comments are compared too, as `isEqualNode` does.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Comparing `children` instead of `childNodes` | Text differences are ignored |
| Checking only that `a`'s attributes exist in `b` | `b` with *extra* attributes passes |
| Comparing `attributes[i]` by index | Attribute order makes equal nodes look different |
| Comparing `textContent` of elements | `<b>ab</b>` vs `<b>a<i>b</i></b>` look equal |
| Forgetting the node-type check | Comparing a text node's `nodeValue` with an element's `null` |

## Real-world connection

- **Virtual DOM diffing** (React, Preact, Vue) asks the same question, "is this node the same as before?", but cheaply: same `type` and `key` means "same node, patch its props and children"; anything else means replace the subtree. A full structural comparison like this one would be too slow on every render, which is why React relies on heuristics.
- **Snapshot tests** and HTML-diffing tools compare trees structurally and report the first differing path.
- **Server-side rendering hydration** checks that the client render matches the server HTML. React logs a hydration mismatch warning when this comparison fails.

## Follow-ups

- **Report the difference:** carry a path (`div > p:nth-child(2) > #text`) with each stack entry and return it on mismatch.
- **Ignore whitespace-only text nodes:** filter them out before comparing child lists.
- **Namespaces:** compare `namespaceURI` and use `getAttributeNS` so SVG `xlink:href` is handled correctly.
