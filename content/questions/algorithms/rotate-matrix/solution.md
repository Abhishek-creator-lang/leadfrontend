## Brute force: a second grid

The mapping for a clockwise rotation is `new[c][n - 1 - r] = old[r][c]`. Build a fresh `n × n` grid with that formula, then copy it back. It's O(n²) time, which is optimal, but it uses O(n²) **extra memory**, which the prompt forbids. For a 1000 × 1000 image that's a million extra cells.

## Optimal 1: transpose, then reverse each row (reference)

A clockwise rotation is the composition of two simple in-place operations:

1. **Transpose** (mirror across the main diagonal): swap `grid[r][c]` with `grid[c][r]` for every `c > r`. Only the upper triangle is visited, otherwise you'd swap every pair twice and undo the work.
2. **Reverse each row:** `row.reverse()` mirrors horizontally.

Check with the example: transposing gives `[[1,4,7],[2,5,8],[3,6,9]]`, and reversing the rows gives `[[7,4,1],[8,5,2],[9,6,3]]`. ✓

It's easy to remember, easy to prove, and each step is a well-known primitive.

## Optimal 2: rotate four cells at a time, ring by ring

For each concentric ring (layer `l`), and each offset `i` along its top edge, cycle the four corresponding cells (top → right → bottom → left) using one temporary variable. It touches each cell exactly once (versus twice for transpose + reverse). The index arithmetic is fiddlier, which is where bugs creep in during interviews.

## Complexity

- **Time:** O(n²). Every cell has to move, so you can't do better.
- **Space:** O(1) extra.

## Edge cases

- `n = 0` (empty grid) and `n = 1`: nothing to do.
- Odd n: the centre cell stays put. Both methods handle it naturally.
- Return the **same** grid reference.

## Talking through it in an interview

Write the coordinate mapping first. Then say "this is a transpose followed by a horizontal flip" and prove it on the 3 × 3 example. If the interviewer asks for single-pass rotation, explain the four-way cycle with a diagram of one ring.

## Follow-ups

- **Counter-clockwise:** transpose, then reverse the **column order** (reverse the outer array). Or reverse each row first, then transpose.
- **180°:** reverse the outer array, then reverse each row.
- **m × n grids:** the shape changes to n × m, so a new grid is unavoidable: `result[c][m - 1 - r] = grid[r][c]`.
- **Real image rotation in the browser:** use canvas transforms (`ctx.rotate`) or CSS `transform: rotate(90deg)`. Doing it by hand only matters for pixel-grid editors, game boards (Tetris pieces) and similar.
