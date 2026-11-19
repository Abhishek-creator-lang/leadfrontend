## Brute force

Enumerate every simple path from `from` with DFS/backtracking and keep the shortest one that ends at `to`. It's correct, but the number of simple paths grows exponentially with the size of the graph, so it collapses on anything but toy inputs.

## Optimal: BFS with parent pointers

BFS explores the graph in **rings**: first every page 1 click away, then every page 2 clicks away, and so on. The first time it reaches `to`, it has done so with the minimum number of clicks, because every shorter distance was fully explored first.

1. Put `from` in a queue and record `parent.set(from, null)`. The `parent` map doubles as the visited set.
2. Dequeue a page. For every link not yet in `parent`, record `parent.set(next, page)` and enqueue it.
3. When you discover `to`, stop and **walk the parent pointers back** to `from`, then reverse the result.
4. If the queue empties first, return `null`.

Mark nodes as visited **when they're enqueued**, not when they're dequeued. Otherwise the same page can be enqueued many times, which in dense graphs blows the queue up to O(E) entries and wastes work.

Use an index pointer into an array (or a real queue) rather than `Array.prototype.shift`, which is O(n) per call.

## Complexity

- **Time:** O(V + E).
- **Space:** O(V) for the queue and the parent map.

## Edge cases

- `from === to` → `[from]` with zero clicks.
- Target unreachable → `null`.
- Cycles: handled by the visited/parent map.
- Pages with no key in `links`.

## Talking through it in an interview

Say "unweighted shortest path, so BFS" before writing anything. That one sentence is what the interviewer is listening for. Explain the ring-by-ring argument, then the parent map for rebuilding the path. Mention the `shift()` performance trap.

## Follow-ups

- **DFS doesn't give shortest paths** because it commits to one branch fully. It might reach the target via a 10-click detour before trying the 1-click link.
- **Weighted edges:** Dijkstra's algorithm, which is BFS with a priority queue instead of a FIFO queue.
- **Bidirectional BFS:** search from both ends and stop when the frontiers meet. That shrinks the explored area from roughly b^d to 2·b^(d/2).
- **Front-end uses:** level-order DOM walks, "degrees of separation" in social graphs, shortest navigation paths for analytics, and flood fill in canvas tools.
