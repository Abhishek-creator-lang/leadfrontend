## Choosing the shape

A **singly** linked list with `head` and `tail` pointers gives O(1) `push`, `unshift` and `shift`, but `pop` is O(n): to remove the tail you need the node *before* it, and the only way to find it is to walk from the head. That's the "brute force" version.

The optimal version is **doubly** linked: each node has `prev` and `next`. Now the tail's predecessor is one hop away, so `pop` is O(1) too. A `size` counter makes `length()` O(1).

## Key operations

- **`push` / `unshift`:** create a node, wire it to the current tail/head, move the pointer. If the list was empty, the node becomes both head and tail.
- **`pop` / `shift`:** detach the end node, move the pointer inward, and clear the new end's outward link. If the list becomes empty, reset both pointers.
- **`get(index)`:** walk from whichever end is closer. Still O(n), but half the hops on average.
- **`insertAt` / `removeAt`:** delegate index `0` and `length` (or `length - 1`) to the end operations, so the middle case can assume both neighbours exist. Then splice four pointers.
- **`reverse`:** walk every node and swap its `prev` and `next`, then swap `head` and `tail`. For a singly linked list the classic version uses three variables: `prev`, `current`, `next`.

## Complexity

| Operation | Time |
|---|---|
| `push`, `unshift`, `pop`, `shift`, `length` | O(1) |
| `get`, `insertAt`, `removeAt` | O(n) |
| `toArray`, `reverse` | O(n) |

Space is O(n) for the nodes, and O(1) extra for every operation except `toArray`.

## Edge cases

- Removing the only node must clear **both** `head` and `tail`.
- Index bounds: `insertAt` accepts `index === length` (append), but `removeAt` and `get` don't.
- Negative and non-integer indices are out of range.
- `reverse()` on an empty or one-node list must be a no-op.

## Talking through it in an interview

Draw boxes and arrows. Say the invariant out loud: "`head.prev` and `tail.next` are always `null`, and `size` matches the node count". Handle the ends first and let the middle case rely on them. That cuts the number of special cases roughly in half. Test the one-node case mentally after every method.

## Follow-ups

- **Cycle detection:** Floyd's tortoise and hare. One pointer moves one step and the other moves two. They meet if and only if there's a cycle.
- **Arrays vs lists in JS:** engines store arrays contiguously, so iteration and random access are much faster. Linked lists win when you have a *reference to a node* and need O(1) removal, as in an LRU cache (hash map + doubly linked list), or React's fiber tree, which links siblings with `sibling`/`return` pointers.
- **Sentinel nodes:** a dummy head and tail remove most of the `null` checks.
