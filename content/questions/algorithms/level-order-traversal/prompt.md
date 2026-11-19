An org-chart component draws a binary reporting tree one **row per level**: the CEO on row 0, their direct reports on row 1, and so on. Each node is `{ value, left, right }`, where `left`/`right` are nodes or `null`.

Write `levelOrder(root)`, which returns an array of rows. Each row lists the values at that depth from **left to right**.

```js
//        Ada
//       /   \
//    Grace   Linus
//    /          \
//  Alan        Barbara
const root = {
  value: 'Ada',
  left: { value: 'Grace', left: { value: 'Alan', left: null, right: null }, right: null },
  right: { value: 'Linus', left: null, right: { value: 'Barbara', left: null, right: null } },
};

levelOrder(root);
// [['Ada'], ['Grace', 'Linus'], ['Alan', 'Barbara']]

levelOrder(null); // []
```

## Constraints

- Up to 10⁵ nodes. The tree can be very unbalanced (thousands of levels deep).
- O(n) time.

## Follow-up

- Return the rows in zig-zag order (alternate left→right and right→left).
- Return only the right-most value per row (what you'd see looking at the tree from the right).
