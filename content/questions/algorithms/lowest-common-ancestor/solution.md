## Brute force

For every node, check with a full subtree search whether it contains both `a` and `b`, and keep the deepest such node. That's O(n) per node, so O(n²) overall.

## Approach 1: recursive post-order

`search(node)` returns how many of `{a, b}` are in `node`'s subtree, or returns the LCA once found. The first node (in post-order) whose subtree contains both is the answer. Children are checked before their parent, so the deepest such node wins. It's O(n), but the recursion depth equals the tree depth, and a 10⁴-deep chain of nested `<div>`s can overflow the call stack.

## Approach 2: parent map + ancestor set (reference)

1. Walk the tree **iteratively** (explicit stack), recording `parent.set(child, node)` for every child, until both `a` and `b` have been reached. You can stop early once both are in the map.
2. Walk from `a` up to the root via `parent`, putting every node into a `Set` (including `a` itself).
3. Walk from `b` upward. The first node found in the set is the LCA.

This is O(n) time and space, never recurses, and directly mirrors how you'd do it in the real DOM.

## Complexity

- **Time:** O(n) to build the parent map; O(depth) for the two climbs.
- **Space:** O(n) for the map and stack.

## Edge cases

- `a === b` → that node.
- One node is an ancestor of the other → the ancestor (it's its own descendant).
- One of them is the root → the root.
- Very deep or very wide trees: the iterative walk handles both.

## Talking through it in an interview

Ask whether nodes have parent pointers. It changes the problem. Without them, explain both approaches, and pick the parent map if the tree may be deep, saying why. Clarify the "node is its own descendant" rule early.

## Follow-ups

- **With parent pointers (the real DOM):** climb from `a` collecting ancestors, then climb from `b`. O(depth), no full traversal. Alternatively, compute both depths, lift the deeper node to the same depth, then climb both in lock-step until they meet: O(depth) time, O(1) space.
- **Browser built-ins:** `Node.contains()` checks descendancy, and `Range.commonAncestorContainer` returns exactly this LCA for a selection.
- **Many queries on a static tree:** binary lifting (O(log n) per query after O(n log n) preprocessing) or an Euler tour plus a range-minimum structure (O(1) per query).
- **Binary search trees:** the LCA is the first node whose value lies between `a` and `b`, which takes O(h) without any extra memory.
