/**
 * @param {string} text
 * @return {number} Length of the longest substring with no repeated characters.
 */
export default function longestUniqueRun(text) {
  const lastSeen = new Map();
  let left = 0;
  let best = 0;

  for (let right = 0; right < text.length; right++) {
    const ch = text[right];
    const prev = lastSeen.get(ch);
    if (prev !== undefined && prev >= left) {
      left = prev + 1;
    }
    lastSeen.set(ch, right);
    best = Math.max(best, right - left + 1);
  }

  return best;
}
