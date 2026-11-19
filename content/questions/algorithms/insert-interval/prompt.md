A room-booking widget keeps the room's busy blocks as a list of `[start, end]` intervals that is **sorted by start and has no overlapping or touching blocks**. When someone books a new slot, the list must be updated.

Write `insertInterval(blocks, slot)`, which returns a new list with `slot` added, still sorted, with any blocks that overlap or touch the slot merged into it.

```js
insertInterval([[0, 30], [60, 90], [120, 150], [200, 210]], [80, 130]);
// [[0, 30], [60, 150], [200, 210]]

insertInterval([[0, 30], [60, 90]], [40, 50]);
// [[0, 30], [40, 50], [60, 90]]

insertInterval([[0, 30]], [30, 45]);
// [[0, 45]] (touching blocks merge)

insertInterval([], [5, 10]);
// [[5, 10]]
```

## Requirements

- Don't mutate `blocks`, its inner arrays, or `slot`.
- The slot may come before all blocks, after all blocks, swallow several blocks, or sit inside one.

## Constraints

- Up to 10⁵ blocks. Solve it in **O(n)**: the input is already sorted, so you shouldn't need to sort again.

## Follow-up

- Could you find the affected range with binary search? Does that improve the overall complexity?
- How would you *remove* a slot (a cancellation), possibly splitting a block in two?
