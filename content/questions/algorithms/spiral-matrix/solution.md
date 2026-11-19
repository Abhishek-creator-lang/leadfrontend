## Approach 1: simulate with a direction and a visited grid

Walk like a robot: start at `(0, 0)` heading right. Turn clockwise whenever the next cell is out of bounds or already visited. Stop after `rows × cols` steps. It's correct and easy to reason about, but it needs an O(rows × cols) visited array, and the turn logic is easy to get subtly wrong.

## Approach 2: shrinking boundaries (reference)

Keep four boundaries: `top`, `bottom`, `left` and `right`. Each loop peels off the outermost ring:

1. **Top row**, left → right, then `top++`.
2. **Right column**, top → bottom, then `right--`.
3. **Bottom row**, right → left, **only if `top <= bottom`**, then `bottom--`.
4. **Left column**, bottom → top, **only if `left <= right`**, then `left++`.

Repeat while `top <= bottom && left <= right`.

The two guards are the whole difficulty. When the remaining area is a single row (or column), steps 1 and 2 have already consumed it, and without the guard, steps 3 and 4 would walk back over the same cells and output duplicates. The `[[1, 2, 3]]` and `[[1], [2], [3]]` tests exist for exactly this case.

## Complexity

- **Time:** O(rows × cols). Each cell is output once.
- **Space:** O(1) beyond the output (Approach 1 needs O(rows × cols) for visited flags).

## Edge cases

- Empty grid `[]`, or rows that are empty `[[]]`.
- Single row, single column.
- Wide and tall rectangles where the innermost "ring" is a line.
- 1 × 1.

## Talking through it in an interview

Draw the four boundaries on a 3 × 4 example and peel one ring. Then deliberately trace a single-row grid to show why the guards on steps 3 and 4 are needed. That shows you test your own code before the interviewer does.

## Follow-ups

- **Generating a spiral** (fill `1..n²`): the same boundary loop, writing instead of reading.
- **Counter-clockwise / starting elsewhere:** reorder the four steps.
- **CSS reveal:** compute each tile's position in the spiral, set `style={{ '--i': index }}` and use `animation-delay: calc(var(--i) * 30ms)`. Respect `prefers-reduced-motion` by disabling the stagger.
