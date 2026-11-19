Implement a `BinarySearchTree` class that stores **unique numbers**. For every node, all values in its left subtree are smaller and all values in its right subtree are larger. Think of it as the index behind a timeline component that needs to insert timestamps, remove them, and list them in order.

```js
const timeline = new BinarySearchTree();
timeline.insert(1700);   // true
timeline.insert(1200);   // true
timeline.insert(2400);   // true
timeline.insert(1200);   // false (already present)
timeline.has(2400);      // true
timeline.min();          // 1200
timeline.remove(1700);   // true (removing a node with two children)
timeline.inOrder();      // [1200, 2400]
timeline.size();         // 2
```

## API

| Method | Returns | Description |
|---|---|---|
| `insert(value)` | `boolean` | Adds `value`; returns `false` if it was already present. |
| `has(value)` | `boolean` | Whether `value` is in the tree. |
| `remove(value)` | `boolean` | Removes `value`; returns `false` if it wasn't present. |
| `min()` / `max()` | `number \| undefined` | Smallest / largest value, `undefined` when empty. |
| `inOrder()` | `number[]` | All values in ascending order. |
| `size()` | `number` | Number of values. |

## Constraints

- `insert`, `has`, `remove`, `min` and `max` should be O(h), where h is the tree height. You don't need to keep the tree balanced.
- Values may be inserted in sorted order, which makes the tree a long chain, so avoid deep recursion.

## Follow-up

- What happens to the height when values arrive already sorted, and how do self-balancing trees fix it?
- How would you find the smallest value `≥ x` (a "ceiling" query)?
