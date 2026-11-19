## The tempting wrong answer

Check only that `left.value < node.value < right.value` at every node. That's a purely local check, and `tree2` in the prompt passes it: 9 is a valid right child of 3. But 9 sits in 8's **left** subtree, where everything must be smaller than 8. The BST property is about **whole subtrees**, not just direct children. Spotting this is the main thing the question tests.

## Brute force

For every node, scan its entire left subtree for the maximum and its right subtree for the minimum, and compare them with the node. That's correct, but O(n²) on a chain-shaped tree.

## Optimal 1: pass down allowed bounds

Each node must lie in an open interval `(low, high)` inherited from its ancestors:

- the root has `(-Infinity, Infinity)`;
- going left narrows the upper bound to `node.value`;
- going right narrows the lower bound to `node.value`.

A node outside its interval → invalid. That's O(n), checking each node once. The reference does this with an explicit stack of `[node, low, high]` so a degenerate 10⁵-deep chain doesn't overflow the call stack.

Use `-Infinity`/`Infinity` (or `null` meaning "unbounded"), not sentinel numbers like `Number.MIN_SAFE_INTEGER`. A sentinel can collide with real data.

## Optimal 2: in-order traversal must be strictly increasing

An in-order walk of a valid BST visits values in sorted order. Walk iteratively and compare each value with the previous one. If any value is `<=` the previous, the tree is invalid. Same O(n), and it's elegant to explain.

## Complexity

- **Time:** O(n).
- **Space:** O(h) for the stack, where h is the tree height (O(n) worst case).

## Edge cases

- `null` → `true`; a single node → `true`.
- Duplicates → `false` (strict inequalities).
- The deep-violation case (`tree2`).
- Negative values and huge magnitudes, which is why sentinels are a bad idea.
- Degenerate chains, which call for iteration.

## Talking through it in an interview

Draw `tree2` and show why the local check fails *before* coding. Then present bounds-passing and mention in-order as an alternative. Discuss recursion depth and why you went iterative.

## Follow-ups

- **Two swapped nodes:** in-order, find the "drops" where `prev > current`. With adjacent swaps there's one drop, otherwise two. The first drop's `prev` and the last drop's `current` are the swapped pair. Swap them back. This is O(n) time, and O(1) space with a Morris traversal.
- **Equal keys go right:** the left bound stays strict (`< node`) and the right bound becomes inclusive (`>= node`).
- **Why it matters:** BST-backed structures (ordered maps, interval trees) silently return wrong results when the invariant breaks. A validator like this is a great property-based test.
