/**
 * @param {Array<*>} flags Distinct items.
 * @return {Array<Array<*>>} Every subset, in any order.
 */
export default function subsets(flags) {
  const result = [[]];

  for (const flag of flags) {
    // Every existing subset spawns a twin that also includes `flag`.
    const count = result.length;
    for (let i = 0; i < count; i++) {
      result.push([...result[i], flag]);
    }
  }

  return result;
}
