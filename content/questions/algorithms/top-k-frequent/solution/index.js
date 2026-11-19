/**
 * @param {Array<string | number>} items
 * @param {number} k
 * @return {Array<string | number>} The k most frequent values, in any order.
 */
export default function topKFrequent(items, k) {
  const counts = new Map();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);

  // buckets[c] holds the values that occur exactly c times.
  const buckets = Array.from({ length: items.length + 1 }, () => []);
  for (const [value, count] of counts) buckets[count].push(value);

  const result = [];
  for (let c = buckets.length - 1; c > 0 && result.length < k; c--) {
    for (const value of buckets[c]) {
      result.push(value);
      if (result.length === k) break;
    }
  }
  return result;
}
