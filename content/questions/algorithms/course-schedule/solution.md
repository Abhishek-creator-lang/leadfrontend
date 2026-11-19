## Reframing

Build a directed graph with an edge `required → lesson`. Every lesson can be completed **if and only if the graph has no cycle**. A cycle means each lesson in it waits on another one in it, forever. So this is cycle detection in a directed graph, and equivalently, "does a topological order exist?".

## Brute force

For every lesson, run a DFS along its prerequisites and check whether you can get back to the starting lesson. That's O(V · (V + E)). Worse, a DFS that doesn't remember finished nodes re-explores shared prerequisites once per path, which is exponential on stacked diamonds.

## Optimal 1: Kahn's algorithm (reference)

1. Build the adjacency list `unlocks[required] = [lessons]` and `pending[lesson]` = the number of prerequisites.
2. Queue every lesson with `pending === 0`.
3. Pop a lesson, count it as completed, and decrement `pending` for each lesson it unlocks. Queue any that reach 0.
4. All lessons can be finished iff `completed === lessonCount`.

It's iterative (safe for long chains), and the pop order is itself a valid study plan.

## Optimal 2: DFS with three colours

Mark each node as `unvisited`, `inProgress` or `done`. Visiting a node marks it in progress, recurses into its neighbours, then marks it done. Reaching an **in-progress** node means you've found a back edge, which is a cycle. Reaching a `done` node returns immediately; that memoisation is what keeps it O(V + E). The in-progress path also lets you report the cycle for the editor UI.

## Complexity

O(V + E) time and space for either approach.

## Edge cases

- Self-prerequisite `[x, x]` → cycle.
- Duplicate pairs: with Kahn's they add to both `pending` and `unlocks` symmetrically, so counts still reach 0 correctly.
- No prerequisites → `true`.
- Disconnected lessons: Kahn's starts from all zero-in-degree nodes, so nothing is missed.

## Talking through it in an interview

Say "this is cycle detection in a directed graph" in the first minute, and clarify the edge direction from the pair format. Then pick Kahn's or three-colour DFS and explain why an undirected-style "visited" set isn't enough: in a directed graph, reaching a node that's already finished is *not* a cycle.

## Follow-ups

- **Return an order:** collect the pop order from Kahn's (see *Topological Sort*).
- **Highlight the cycle:** with DFS, when you hit an in-progress node, slice the current recursion path from that node. With Kahn's, the nodes left with `pending > 0` are on or downstream of cycles.
- **Minimum number of semesters** (parallel study): process Kahn's queue level by level and count the levels.
