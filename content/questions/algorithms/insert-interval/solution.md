## Brute force

Append the slot and run the general *Merge Intervals* algorithm: sort, then sweep. It's correct and short, and a reasonable first answer, but the sort costs O(n log n) and ignores the fact that the input is already sorted.

## Optimal: three phases, one pass

Walk the blocks with a single index `i`:

1. **Before.** While `blocks[i].end < slot.start`, the block ends strictly before the slot begins. Copy it to the output unchanged.
2. **Overlap.** While `blocks[i].start <= slot.end`, the block overlaps or touches the slot. Absorb it: `start = min(start, block.start)`, `end = max(end, block.end)`. Then push the merged `[start, end]`.
3. **After.** Copy every remaining block.

Because the blocks are sorted and disjoint, these three groups are contiguous, in that order. That's what makes one pass sufficient.

The comparisons decide whether touching blocks merge: phase 1 uses strict `<`, and phase 2 uses `<=`. A block ending exactly at `slot.start` therefore falls into phase 2 and merges.

## Complexity

- **Time:** O(n). Each block is examined once.
- **Space:** O(n) for the new list (O(1) extra beyond the output).

Binary search can locate the start and end of phase 2 in O(log n), but building the new array is still O(n). It only pays off if you mutate in place with `splice` on a structure that makes splicing cheap.

## Edge cases

- Empty `blocks`.
- Slot before everything or after everything: phase 2 absorbs nothing and still pushes the slot.
- Slot inside a single block: the result is just that block.
- Slot that swallows every block.
- Touching on either side.

## Talking through it in an interview

Draw a number line with the slot in the middle and label the three regions. The code is then three `while` loops. Point out that the problem says "sorted and disjoint", and say why the O(n) solution relies on both.

## Follow-ups

- **Cancellation (removing a slot):** blocks entirely inside the removed range disappear; a block that straddles it is trimmed, or **split into two** if the removal is strictly inside it.
- **Many inserts:** with lots of updates, keep the blocks in a balanced BST or an interval tree keyed by start for O(log n) updates.
- **Calendar UI:** this is how optimistic updates work when a user drags a new booking onto a busy timeline. You compute the merged list locally and reconcile it with the server response.
