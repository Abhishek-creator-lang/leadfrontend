## Brute force

Repeatedly look for any pair of overlapping intervals, replace them with their union, and start again until no pair overlaps. Each pass is O(n²) and up to n passes may be needed, so it's O(n³). A slightly better version compares each interval against every block built so far, which is O(n²) and still too slow for 10⁵ events.

## Optimal: sort, then sweep once

1. **Copy and sort** the events by start time.
2. Walk the sorted list, keeping the **last block** in the output:
   - if `event.start <= last.end`, it overlaps or touches, so extend: `last.end = Math.max(last.end, event.end)`;
   - otherwise, start a new block with a **copy** of the event.

Why is a single sweep enough? After sorting, any event that could merge with the current block starts before the next block does. Once an event starts after `last.end`, no later event (which starts even later) can reach back into an earlier block.

Two details matter:

- `Math.max` handles containment: `[0, 100]` followed by `[10, 20]` must not shrink the block to end at 20.
- Push copies (`[start, end]`) rather than the original arrays, otherwise extending `last.end` mutates the caller's data.

## Complexity

- **Time:** O(n log n) for the sort plus O(n) for the sweep. If the input is already sorted, it's O(n).
- **Space:** O(n) for the sorted copy and output.

## Edge cases

- Empty input → `[]`; one event → a copy of it.
- Touching events (`[0, 30]`, `[30, 60]`) merge because the comparison is `<=`. Ask the interviewer: in some products back-to-back meetings should display separately.
- Contained and duplicate events.
- Zero-length events.

## Talking through it in an interview

Ask first: "are touching intervals merged?" and "is the input sorted?". Then sketch the events on a timeline. Seeing them sorted makes the single-pass argument obvious. Mention the mutation pitfall; reviewers care about it in real UI code where the events come from props or a store.

## Follow-ups

- **Free slots:** merge, then emit the gaps between consecutive blocks, clipped to working hours.
- **Streaming events:** keep blocks in a sorted structure and use *Insert Interval* logic for each new event.
- **Rendering overlapping events side by side** (like Google Calendar's week view): group events into overlapping clusters with this same sweep, then assign columns greedily within each cluster. That's the *Meeting Rooms II* idea.
