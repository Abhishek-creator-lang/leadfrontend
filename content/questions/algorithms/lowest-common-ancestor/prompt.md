When a user selects text that starts in one element and ends in another, the editor needs the **closest element that contains both**. That's the lowest common ancestor (LCA).

The document is a tree of plain objects shaped like a DOM: each node is `{ tag, children }`, where `children` is an array of nodes (possibly empty). Nodes have **no parent pointers**.

Write `lowestCommonAncestor(root, a, b)`, where `a` and `b` are node objects inside the tree (compared by reference). Return the deepest node that has both `a` and `b` as descendants. A node counts as a descendant of itself.

```js
const em = { tag: 'em', children: [] };
const strong = { tag: 'strong', children: [] };
const p1 = { tag: 'p', children: [em] };
const p2 = { tag: 'p', children: [strong] };
const article = { tag: 'article', children: [p1, p2] };
const body = { tag: 'body', children: [article] };

lowestCommonAncestor(body, em, strong); // article
lowestCommonAncestor(body, em, p1);     // p1 (a node is its own descendant)
lowestCommonAncestor(body, em, em);     // em
```

## Requirements

- `a` and `b` are guaranteed to be in the tree.
- Return the node object itself, not a copy.

## Constraints

- Up to 10⁵ nodes. The tree may be very deep (a chain of tens of thousands of nested elements, enough to overflow a naive recursive walk) or very wide.
- Aim for O(n).

## Follow-up

- How does it get easier if every node has a `parent` pointer, like the real DOM?
- How would you answer many LCA queries on the same tree quickly?
