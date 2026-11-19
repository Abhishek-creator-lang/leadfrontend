## The two heuristics

A general tree diff is O(n³). Every practical virtual DOM uses two assumptions to make it O(n), and the solution is built on them:

1. **Different `type` (or `key`) means a different subtree.** Don't try to morph a `<div>` into a `<p>`; throw it away and build the new one.
2. **Keys identify children across renders.** A child with key `"b"` is "the same item" wherever it moves in the list.

## Structure

```text
patch(old, new)
  ├─ type/key differ  → createEl(new); old.el.replaceWith(new.el)
  ├─ text node        → reuse el; update nodeValue if changed
  └─ element          → reuse el; patchProps; patchChildren
```

`newVNode.el = oldVNode.el` is the line that carries DOM identity forward. Every vnode in the new tree ends up holding the DOM node it describes, ready to be the "old" tree in the next patch.

### `patchProps`

Two passes:

- **Removed props:** for every key in `oldProps` not present (or now `null`/`false`) in `newProps`: remove the attribute, or `removeEventListener` with the **old** handler.
- **New or changed props:** for every key whose value changed (`!==`): for events, remove the old handler and add the new; for `value`/`checked`, assign the property; otherwise `setAttribute`.

Event listeners must be removed with the exact function that was added, which is why we keep handlers in the vnode props: the old vnode remembers what was attached.

Note `value`: comparing against the old **vnode** value is not quite enough for inputs, because the user may have typed since. React compares against the live `el.value`. That's worth mentioning.

### `patchChildren`: match, patch, remove, reorder

```js
const keyed = new Map();                       // key -> old child
oldChildren.forEach((c) => c.key != null && keyed.set(c.key, c));
const used = new Set();

newChildren.forEach((child, i) => {
  let match = child.key != null ? keyed.get(child.key)
            : oldChildren[i] && oldChildren[i].key == null ? oldChildren[i] : undefined;
  if (match && match.type === child.type && !used.has(match)) {
    used.add(match);
    patch(match, child);                         // reuses match.el
  } else {
    createEl(child);                             // brand new node, not yet in the DOM
  }
});

oldChildren.forEach((c) => used.has(c) || c.el.remove());

newChildren.forEach((child, i) => {
  const current = parent.childNodes[i];
  if (current !== child.el) parent.insertBefore(child.el, current ?? null);
});
```

The final loop is the reorder step. After removing unused nodes, the parent contains exactly the reused nodes (in their old order). We walk the new list and make sure position `i` holds `child.el`. `insertBefore` **moves** a node that's already in the DOM, so reused nodes keep their identity, focus, scroll position, selection, playing video and so on. New nodes get inserted. When the order didn't change, no DOM operations happen at all.

## Complexity

O(n) to build the key map and match, O(n) for removals. The reorder pass does O(n) checks; the number of **moves** can be up to n in the worst case (for example, rotating a list by one moves every node in this naive approach, although moving the one last node would suffice).

### Minimising moves with LIS

Vue 3 and Inferno compute, for the reused children, their old indices in new order, e.g. `[2, 0, 1, 3]`. The **longest increasing subsequence** of that array (`[0, 1, 3]`) is the largest set of nodes that are already in the right relative order and can stay put; only the others move. That's O(n log n) and gives the minimum number of moves. React doesn't use LIS; it does a single left-to-right pass that moves any node whose old index is smaller than the last placed index, which is simpler and good enough for typical updates. Mentioning this is a strong senior signal.

## Why index keys break things

With `key={index}`, deleting the first item makes every remaining item take the key of its predecessor. The diff then **reuses the wrong DOM nodes** and patches their text: an `<input>` that the user typed into stays in position 0 and now sits next to a different label. State lives with the matched node, so it appears to jump between items. Stable ids from the data are the fix.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Recreating every child on change | Loses focus, input state and animations; slow |
| Forgetting to remove listeners for changed handlers | Old and new handlers both fire |
| Matching keyed children by index | Reordered items are patched in place, so DOM state ends up on the wrong item |
| Removing old nodes after inserting new ones by position | Indices are off and nodes end up in the wrong place |
| Not setting `newVNode.el` | The next patch has nothing to work with |
| Reusing an old child twice (duplicate keys) | One DOM node is "moved" into two positions |

## Real-world connection

- **React** reconciliation follows exactly these heuristics; changing a component's type (or `key`) unmounts the subtree and resets its state, which is also the official trick for resetting a form: `<Form key={userId} />`.
- **Vue 3** (`patchKeyedChildren`) adds prefix/suffix trimming, which handles the common "append" and "remove from the end" cases in O(1), then LIS for the middle.
- **Lit and Svelte** avoid tree diffing by compiling templates into direct updates, but keyed lists (`repeat`, `{#each ... (key)}`) still use this reconciliation.

## Follow-ups

- **Prefix/suffix optimisation:** skip equal-key children at both ends before building the map.
- **Components and state:** store hook state on the matched vnode; type changes discard it.
- **Batching:** collect DOM operations and apply them in one pass, or render into a `DocumentFragment`.
