/**
 * @param {Array<*>} items Distinct items.
 * @return {Array<Array<*>>} Every ordering, in any order.
 */
export default function permutations(items) {
  const n = items.length;
  const result = [];
  const path = [];
  const used = new Array(n).fill(false);

  function choose() {
    if (path.length === n) {
      result.push(path.slice());
      return;
    }
    for (let i = 0; i < n; i++) {
      if (used[i]) continue;
      used[i] = true;
      path.push(items[i]);
      choose();
      path.pop(); // backtrack
      used[i] = false;
    }
  }

  choose();
  return result;
}
