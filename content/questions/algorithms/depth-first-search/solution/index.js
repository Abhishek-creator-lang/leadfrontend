/**
 * Returns the pages reachable from `start` in depth-first visiting order.
 * @param {Record<string, string[]>} links
 * @param {string} start
 * @return {string[]}
 */
export default function depthFirstSearch(links, start) {
  const visited = new Set();
  const order = [];
  const stack = [start];

  while (stack.length > 0) {
    const page = stack.pop();
    if (visited.has(page)) continue;
    visited.add(page);
    order.push(page);

    const next = links[page] ?? [];
    // Push in reverse so the first link is explored first.
    for (let i = next.length - 1; i >= 0; i--) {
      if (!visited.has(next[i])) stack.push(next[i]);
    }
  }

  return order;
}
