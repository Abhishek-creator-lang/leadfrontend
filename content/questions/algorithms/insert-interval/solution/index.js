/**
 * @param {Array<[number, number]>} blocks Sorted, non-overlapping, non-touching.
 * @param {[number, number]} slot
 * @return {Array<[number, number]>}
 */
export default function insertInterval(blocks, slot) {
  const result = [];
  const n = blocks.length;
  let [start, end] = slot;
  let i = 0;

  // 1. Blocks that end strictly before the slot starts.
  while (i < n && blocks[i][1] < start) {
    result.push([blocks[i][0], blocks[i][1]]);
    i++;
  }

  // 2. Blocks that overlap or touch the slot: absorb them.
  while (i < n && blocks[i][0] <= end) {
    start = Math.min(start, blocks[i][0]);
    end = Math.max(end, blocks[i][1]);
    i++;
  }
  result.push([start, end]);

  // 3. Blocks after the slot.
  while (i < n) {
    result.push([blocks[i][0], blocks[i][1]]);
    i++;
  }

  return result;
}
