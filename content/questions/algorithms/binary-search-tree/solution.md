## Brute force

A sorted array supports `has` in O(log n) with binary search, but `insert` and `remove` must shift elements, so they're O(n). An unsorted array is O(1) to insert but O(n) for everything else. A BST makes all of these O(h).

## Optimal: a node-based BST

Every operation starts the same way: walk from the root, going left when `value < node.value` and right when it's larger.

- **`has`:** walk until you find the value or fall off the tree.
- **`insert`:** walk until the child slot you'd move into is `null`, then attach the new node there. Hitting an equal value means it's a duplicate, so return `false`.
- **`min` / `max`:** keep going left (or right) from the root.
- **`inOrder`:** in-order traversal with an explicit stack (left, node, right) yields ascending order.
- **`remove`:** find the node and its parent, then handle three cases:
  1. **No children:** unlink it from the parent.
  2. **One child:** link the parent straight to that child.
  3. **Two children:** find the **in-order successor** (the leftmost node of the right subtree), copy its value into the node, then delete the successor. The successor has no left child, so its removal falls into case 1 or 2.

The reference uses loops rather than recursion everywhere, so a degenerate (chain-shaped) tree can't overflow the stack.

## Complexity

| Operation | Average (random inserts) | Worst (sorted inserts) |
|---|---|---|
| `insert`, `has`, `remove`, `min`, `max` | O(log n) | O(n) |
| `inOrder` | O(n) | O(n) |

Space is O(n) for the nodes, plus O(h) for the traversal stack.

## Edge cases

- Removing the **root**, especially when it has 0 or 1 children: the root pointer itself has to change. Tracking `parent` (with `null` meaning root) handles this.
- Removing a node whose successor is its direct right child.
- Empty tree: `min`/`max` return `undefined`, and `remove` returns `false`.
- Keep `size` in sync: only change it when an insert or remove actually happens.

## Talking through it in an interview

State the BST invariant, then write `has`, since it's the template for everything else. Spend most of the time on `remove`. Draw all three cases before coding, and call out the root-removal case explicitly.

## Follow-ups

- **Balancing:** AVL and red-black trees rotate nodes after inserts and removes to keep the height O(log n). In practice, JS apps usually reach for a sorted array plus binary search (small n) or a B-tree/skip list library.
- **Ceiling / floor queries:** walk down, remembering the best candidate seen so far. That's O(h).
- **Range queries** (all events between t1 and t2): an in-order walk that prunes subtrees outside the range.
