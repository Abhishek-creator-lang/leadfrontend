/**
 * @param {Array<[number, number]>} meetings Half-open [start, end) intervals.
 * @return {number}
 */
export default function minMeetingRooms(meetings) {
  const starts = meetings.map((m) => m[0]).sort((a, b) => a - b);
  const ends = meetings.map((m) => m[1]).sort((a, b) => a - b);

  let rooms = 0;
  let e = 0;
  for (const start of starts) {
    if (start >= ends[e]) {
      // A meeting has ended by now: reuse its room.
      e++;
    } else {
      rooms++;
    }
  }
  return rooms;
}
