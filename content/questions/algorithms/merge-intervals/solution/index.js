/**
 * @param {Array<[number, number]>} events
 * @return {Array<[number, number]>} Busy blocks sorted by start.
 */
export default function mergeIntervals(events) {
  const sorted = events.slice().sort((a, b) => a[0] - b[0]);
  const blocks = [];

  for (const [start, end] of sorted) {
    const last = blocks[blocks.length - 1];
    if (last !== undefined && start <= last[1]) {
      last[1] = Math.max(last[1], end);
    } else {
      blocks.push([start, end]);
    }
  }

  return blocks;
}
