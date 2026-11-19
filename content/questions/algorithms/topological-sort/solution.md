## Brute force

Repeatedly scan all modules and emit any module whose imports have all been emitted already. Each pass emits at least one module (or proves there's a cycle when it emits none), but there can be V passes of O(V + E) each, so it's O(V · (V + E)).

A naive recursive "emit my dependencies, then me" **without a visited set** is worse: with diamond-shaped dependencies it revisits shared modules once per path, which is exponential.

## Optimal 1: Kahn's algorithm (BFS on in-degrees)

Treat each import as an edge **dependency → dependent**, because a dependency must come first.

1. Collect every module name from both keys and values.
2. For each module, count `pending[m]`, the number of imports not yet emitted. Build a reverse map `dependents[dep] = [modules that import dep]`.
3. Put every module with `pending === 0` in a queue.
4. Pop a module, append it to the result, and decrement `pending` for each of its dependents. Any that reach 0 join the queue.
5. If the result is shorter than the number of modules, the leftovers are stuck waiting on each other: **cycle → throw**.

Kahn's algorithm is iterative (no stack overflow on deep chains) and naturally produces "waves": everything in the queue at the same depth can be built in parallel.

## Optimal 2: DFS with three colours

Mark modules *unvisited / visiting / done*. Visit a module's imports first, then push the module. Reaching a **visiting** node means you've found a back edge, which is a cycle. This is just as fast, and the recursion path gives you the cycle members for free. Watch out for the recursion depth on very long chains.

## Complexity

O(V + E) time and space with either approach.

## Edge cases

- Leaf modules that never appear as keys.
- Duplicate entries in an import list. Count them consistently (the reference dedupes with a `Set`).
- Self-import (`a → a`) is a cycle.
- Empty input → `[]`.
- Disconnected components: all of them must appear.

## Talking through it in an interview

Clarify the edge direction first ("does `A: [B]` mean B must come first?"). Getting it backwards is the classic bug. Mention that multiple valid answers exist, so your tests should check the *property* rather than one exact array. Then pick Kahn's algorithm and explain the cycle check.

## Follow-ups

- **Report the cycle:** in DFS, when you hit a *visiting* node, slice the current path from that node.
- **Parallel waves:** process the queue level by level, so each level is a batch with no inter-dependencies (how `turbo`/`nx` schedule tasks).
- **Real-world uses:** bundler module order, CSS cascade layers, spreadsheet recalculation, migration ordering, and React effects running children before parents.
