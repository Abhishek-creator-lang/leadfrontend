## Brute force

Compute the tree's height h, then for each depth `d` from 0 to h−1 run a fresh DFS that collects the nodes at depth `d`. Each DFS is O(n), so it's O(n · h): O(n²) for a skewed tree.

## Optimal: BFS, one level at a time

A queue processes nodes in order of their distance from the root, which is exactly the row order we want. To know where one row ends and the next begins, **snapshot the queue length** at the start of each level:

```
queue = [root]
while queue not empty:
  size = queue.length          ← number of nodes on this level
  row = []
  repeat size times:
    node = dequeue; row.push(node.value)
    enqueue node.left / node.right if present
  rows.push(row)
```

Children are added to the back of the queue and are only processed in the next iteration of the outer loop.

The reference avoids `Array.prototype.shift` (O(n) per call) by building each next level in a fresh array: `current` holds this level, `next` collects the children, then `current = next`. That's simple, O(1) per node, and needs no index juggling.

## Alternative: DFS with a depth parameter

`visit(node, depth)` pushes `node.value` into `rows[depth]` (creating the row if needed), then visits left before right. Pre-order guarantees left-to-right within each row. It's equally O(n), but recursion depth equals tree height, which risks a stack overflow on a 10⁴-deep skewed tree.

## Complexity

- **Time:** O(n).
- **Space:** O(w) for the queue, where w is the maximum width (up to about n/2 for a complete tree), plus the output.

## Edge cases

- `null` root → `[]`.
- Single node → `[[value]]`.
- Skewed trees: one node per row, many rows.
- Falsy values (`0`, `''`): check `node !== null`, not truthiness of the value.

## Talking through it in an interview

Say "rows = BFS", then explain the queue-size snapshot. It's the key trick, and interviewers often ask why it's needed. Mention the `shift()` cost, and that the DFS version also works but has the recursion-depth caveat.

## Follow-ups

- **Zig-zag:** reverse every other row after building it, or insert at the front of the row for odd levels.
- **Right side view:** the last element of each row.
- **N-ary trees / DOM:** the same algorithm with `for (const child of node.children)`. Use it to process the DOM by depth, for example lazy-rendering deeper levels of a tree view.
- **Level averages, widest level, min depth:** all are one-line changes to the level loop. Min depth can stop early at the first leaf, which BFS finds before DFS would.
