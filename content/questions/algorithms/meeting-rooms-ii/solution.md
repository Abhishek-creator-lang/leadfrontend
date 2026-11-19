## Reframing

"Minimum rooms" equals the **maximum number of meetings in progress at the same instant**. You need at least that many rooms at the peak, and a greedy assignment never needs more.

## Brute force

For every meeting's start time, count how many meetings are running at that instant (`start ≤ t < end`) and take the maximum. Checking start times is enough because the count only increases at a start. That's O(n²), around 10¹⁰ steps for 10⁵ meetings, so it's too slow.

## Optimal 1: sweep over sorted starts and ends (reference)

Split the meetings into two sorted arrays, `starts` and `ends`. Walk the starts in order with a pointer `e` into the ends:

- For each start `s`: if `s >= ends[e]`, some meeting has finished by now, so its room is free. Reuse it and advance `e`.
- Otherwise, open a new room.

Using `>=` implements the half-open rule: a meeting ending at 600 frees its room for one starting at 600. The number of rooms opened is the answer.

Equivalently, you can build `+1` events at starts and `-1` events at ends, sort them so that **ends come before starts at equal times**, and track the running maximum.

## Optimal 2: min-heap of end times

Sort the meetings by start. Keep a min-heap of the end times of rooms in use. For each meeting, if the earliest end is `≤` its start, pop it (reuse that room). Then push this meeting's end. The heap's maximum size is the answer. This version extends naturally to **returning room assignments**: store `[end, roomId]` in the heap.

## Complexity

- **Time:** O(n log n) for sorting; the sweep is O(n). The heap version is also O(n log n).
- **Space:** O(n).

## Edge cases

- Empty list → 0.
- Back-to-back meetings share a room (half-open).
- A long meeting overlapping many short ones.
- Identical meetings each need their own room.

## Talking through it in an interview

Start with the reframing sentence; it turns a scheduling problem into counting. Draw the timeline with +1/-1 markers. Then mention the tie-breaking rule out loud, because it's the bug interviewers look for. If they ask for assignments, switch to the heap version.

## Follow-ups

- **Calendar layout:** the heap version assigns each event a column. Real calendars then widen events into neighbouring columns that are free for their whole duration.
- **When the peak happens:** record the time at which the running count hits its maximum in the event-sweep version.
- **Variant:** "can one person attend all meetings?" is the same as asking whether the answer is ≤ 1, which you can check by sorting and comparing neighbours.
