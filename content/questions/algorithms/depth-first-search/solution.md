## Brute force

A recursive function that visits a page and then recurses into each of its links **without remembering what it has seen** never terminates on a cycle (`post-1 → home → blog → post-1 …`). Even on an acyclic graph it revisits shared pages once per path, which can be exponential.

## Optimal: track visited nodes

**Recursive version.** It reads exactly like the definition:

```js
function visit(page) {
  if (visited.has(page)) return;
  visited.add(page);
  order.push(page);
  for (const next of links[page] ?? []) visit(next);
}
```

**Iterative version (reference).** It uses an explicit stack, so a long chain of links can't overflow the call stack. Two details keep the order identical to the recursive one:

1. Push neighbours in **reverse**, so the first link is on top of the stack and popped next.
2. Mark a node as visited when it's **popped**, not when it's pushed. If you mark on push, a node that is reachable both deep in the first branch and directly from the current node gets "claimed" too early, and the order differs from true DFS.

Because a node can then sit on the stack more than once, skip it when it's popped if it's already visited. The stack can hold up to O(E) entries.

## Complexity

- **Time:** O(V + E). Each reachable node is processed once and each edge pushed once.
- **Space:** O(V) for `visited`/`order`, plus O(E) for the stack in the iterative version (O(V) recursion depth in the recursive one).

## Edge cases

- Cycles and self-links.
- Pages with no entry in `links` (`?? []`).
- Unreachable pages are not included; this is a traversal from `start`, not of the whole graph.
- A `start` that doesn't exist anywhere → `[start]`.

## Talking through it in an interview

Begin with the recursive version, since it's the clearest. Then raise the call-stack limit yourself and convert it to an explicit stack, explaining the reverse-push and mark-on-pop details. Being able to explain why the two versions produce the same order shows you really understand DFS.

## Follow-ups

- **Cycle detection in a directed graph:** use three states (unvisited, on the current path, finished). An edge to an "on path" node is a back edge, which means a cycle.
- **DOM equivalent:** `document.createTreeWalker` and `querySelectorAll` both return elements in *document order*, which is a pre-order DFS of the DOM tree.
- **Applications:** topological sorting, finding connected components, maze/path finding, and detecting circular references in `JSON.stringify`-style serialisers.
