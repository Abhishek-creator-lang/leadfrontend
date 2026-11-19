A client-side cache stores records in a binary search tree keyed by timestamp. After a buggy migration, you need a sanity check. Write `isValidBST(root)`, which returns `true` if the tree is a valid **binary search tree**:

- every value in a node's **left subtree** is strictly **less** than the node's value;
- every value in its **right subtree** is strictly **greater**;
- both subtrees are themselves valid BSTs.

Each node is `{ value, left, right }` with numeric values; `left`/`right` are nodes or `null`. An empty tree (`null`) is valid.

```js
//    8
//   / \
//  3   10
isValidBST(tree1); // true

//     8
//    / \
//   3   10
//    \
//     9      ← 9 is right of 3 (fine locally) but inside 8's LEFT subtree, and 9 > 8
isValidBST(tree2); // false

//   5
//  /
// 5             ← duplicates are not allowed
isValidBST(tree3); // false
```

## Constraints

- Up to 10⁵ nodes; the tree can be degenerate (a chain tens of thousands of nodes deep), so a naive recursive walk may overflow the call stack.
- Values can be any finite numbers, including negatives and very large magnitudes.
- O(n) time.

## Follow-up

- If exactly two nodes' values were swapped by mistake, how would you find them?
- How would you allow duplicates on one side only (e.g. "equal keys go right")?
