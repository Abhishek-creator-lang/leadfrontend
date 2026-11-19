/**
 * Returns the unique values present in every array, ordered by the first array.
 *
 * @template T
 * @param {...Array<T>} arrays
 * @return {Array<T>}
 */
export default function intersection(...arrays) {
  if (arrays.length === 0) return [];

  const [first, ...rest] = arrays;
  const others = rest.map((array) => new Set(array));
  const seen = new Set();
  const result = [];

  for (const value of first) {
    if (seen.has(value)) continue;
    if (others.every((set) => set.has(value))) {
      seen.add(value);
      result.push(value);
    }
  }

  return result;
}
