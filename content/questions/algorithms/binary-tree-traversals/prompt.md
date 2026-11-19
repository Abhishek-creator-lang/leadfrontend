A spreadsheet-style formula editor stores the expression `(a + b) * c` as a binary tree:

```
      *
     / \
    +   c
   / \
  a   b
```

Each node is `{ value, left, right }`, where `left` and `right` are child nodes or `null`. Write `traverseTree(root)`, which returns the node values in all three depth-first orders:

- **pre-order**: node, then left subtree, then right subtree (`* + a b c`, prefix notation);
- **in-order**: left subtree, node, right subtree (`a + b * c`, infix);
- **post-order**: left subtree, right subtree, node (`a b + c *`, the order a calculator evaluates it).

```js
const tree = {
  value: '*',
  left: {
    value: '+',
    left: { value: 'a', left: null, right: null },
    right: { value: 'b', left: null, right: null },
  },
  right: { value: 'c', left: null, right: null },
};

traverseTree(tree);
// {
//   preorder:  ['*', '+', 'a', 'b', 'c'],
//   inorder:   ['a', '+', 'b', '*', 'c'],
//   postorder: ['a', 'b', '+', 'c', '*'],
// }

traverseTree(null); // { preorder: [], inorder: [], postorder: [] }
```

## Constraints

- O(n) time for all three.
- Trees can be very lopsided (thousands of levels deep).

## Follow-up

- Implement in-order traversal iteratively with an explicit stack.
- Can you rebuild a tree from its pre-order and in-order traversals?
