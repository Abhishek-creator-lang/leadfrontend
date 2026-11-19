An office has a list of meetings for the day, each a `[start, end)` pair in minutes. A room can host one meeting at a time. Write `minMeetingRooms(meetings)`, which returns the **minimum number of rooms** needed to host every meeting.

The same number tells a calendar's day view how many side-by-side columns it needs so overlapping events never cover each other.

Intervals are **half-open**: a meeting ending at 600 frees its room for a meeting starting at 600.

```js
minMeetingRooms([[540, 600], [560, 620], [600, 660]]);
// 2: the first two overlap; the third can reuse the first meeting's room

minMeetingRooms([[0, 30], [30, 60], [60, 90]]); // 1 (back to back)
minMeetingRooms([[0, 100], [10, 20], [15, 25], [50, 60]]); // 3
minMeetingRooms([]); // 0
```

## Constraints

- Up to 10⁵ meetings, unsorted. Aim for O(n log n).
- `start < end` for every meeting.
- Don't mutate the input.

## Follow-up

- Return the actual room assignment for each meeting, not just the count.
- How would you show *when* the peak occurs?
