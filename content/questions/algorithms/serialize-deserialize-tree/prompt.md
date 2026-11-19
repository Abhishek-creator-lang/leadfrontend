A collaborative whiteboard stores a decision tree diagram as a binary tree in memory, and needs to save it to `localStorage` and share it in URLs. Implement a `TreeCodec` class with two methods:

- `serialize(root)` turns a tree into a **string**;
- `deserialize(text)` rebuilds a tree with the **same shape and values**.

Nodes are `{ value, left, right }`, where `value` is an integer (possibly negative) and `left`/`right` are nodes or `null`.

```js
//      1
//     / \
//    2   3
//       / \
//     -4   5
const codec = new TreeCodec();
const text = codec.serialize(root);     // any string format you like
const copy = codec.deserialize(text);   // a new tree, structurally equal to root

codec.deserialize(codec.serialize(null)); // null
```

## Requirements

- `deserialize(serialize(tree))` must produce a tree that is **deeply equal** to the original. Shape matters: a node with only a left child is different from one with only a right child.
- The output of `serialize` must be a string. Don't use `JSON.stringify` on the whole tree (that would make the exercise trivial), though you may use it for individual values if you like.
- The codec must not keep state between calls. Any instance can deserialize any string.

## Constraints

- Up to 10⁵ nodes, and the tree may be a chain tens of thousands of nodes deep, so recursion may overflow the stack.
- O(n) time for both directions.

## Follow-up

- How would you make the string shorter for a **binary search tree**?
- How would you support arbitrary string values (which may contain your separator character)?
