## Brute force

One naive approach gives each painted cell its own label, then repeatedly sweeps the grid, merging labels of neighbouring cells until nothing changes. Each sweep is O(R·C), and a long snake-shaped island needs O(R·C) sweeps, so it's O((R·C)²) in the worst case.

## Optimal: scan + flood fill

Treat the grid as a graph: each painted cell is a node, with edges to its painted up/down/left/right neighbours. The number of islands is the number of **connected components**.

1. Scan every cell in order.
2. When you find a painted cell that hasn't been visited yet, you've found a new island: increment the count, then **flood fill** from it, marking every connected painted cell as visited.
3. Continue the scan. Cells already visited are skipped.

**Visited tracking without mutating the input:** use a `Uint8Array(rows * cols)` indexed by `r * cols + c`. Overwriting `grid[r][c] = 0` is the classic shortcut, but it's forbidden here, and it's a side effect a code reviewer would flag.

**Iterative fill:** a recursive DFS over a 250,000-cell island recurses 250,000 deep and overflows the stack. Use an explicit stack (DFS) or a queue (BFS). Mark cells as visited **when pushing** so they aren't pushed twice.

## Complexity

- **Time:** O(R × C). Every cell is scanned once and pushed at most once.
- **Space:** O(R × C) for the visited array and the worst-case stack.

## Edge cases

- Empty grid or empty rows → 0.
- All water → 0; all land → 1.
- Diagonal-only contact: separate islands.
- Islands touching the border: bounds checks before indexing.
- Very large single island: needs the iterative fill.

## Talking through it in an interview

Map the problem to "count connected components", then describe scan + fill. Bring up the two senior-level details: don't mutate input, and avoid deep recursion. Mention BFS vs DFS: both work, and the choice only changes the shape of the frontier.

## Follow-ups

- **Largest island:** have the fill return the number of cells it visited, and track the maximum.
- **Incremental painting:** union-find (disjoint set with path compression and union by rank). Each new cell starts as its own set and unions with painted neighbours; the island count is the number of sets. Each paint is near-O(1).
- **Front-end connection:** the bucket/fill tool in image editors is exactly this flood fill on pixels (with a colour-tolerance check instead of `=== 1`), and "magic wand" selection is the same algorithm.
