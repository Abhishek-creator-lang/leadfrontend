/**
 * Returns a shortest path of pages from `from` to `to` (inclusive), or null if unreachable.
 * @param {Record<string, string[]>} links
 * @param {string} from
 * @param {string} to
 * @return {string[] | null}
 */
export default function breadthFirstSearch(links, from, to) {
  if (from === to) return [from];

  const parent = new Map([[from, null]]); // also serves as the visited set
  const queue = [from];

  for (let head = 0; head < queue.length; head++) {
    const page = queue[head];
    for (const next of links[page] ?? []) {
      if (parent.has(next)) continue;
      parent.set(next, page);
      if (next === to) return buildPath(parent, to);
      queue.push(next);
    }
  }

  return null;
}

function buildPath(parent, to) {
  const path = [];
  for (let page = to; page !== null; page = parent.get(page)) path.push(page);
  return path.reverse();
}
