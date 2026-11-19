## Brute force

Wrap an array and use `push` to enqueue and `shift` to dequeue. It is correct, and for a handful of toasts it's fine, but `shift` has to move every remaining element down one slot, so each dequeue is O(n) and draining a queue of n items is O(n²).

## Optimal: a singly linked list with head and tail pointers

Keep two references:

- `head`: the node that will be dequeued next.
- `tail`: the node most recently enqueued.

**Enqueue** creates a node, links `tail.next` to it, and moves `tail`. If the queue was empty, the new node is also the `head`.
**Dequeue** reads `head.value`, moves `head` to `head.next`, and, if that empties the queue, also clears `tail`.

A counter keeps `length()` O(1).

Alternatives worth mentioning:

- **Array plus a head index.** Never shift; just advance an index and occasionally compact the array when the dead prefix gets large. Very cache-friendly.
- **Two stacks.** Push onto an "in" stack; when the "out" stack is empty, pour everything across. Each item moves at most twice, so operations are amortised O(1).

## Complexity

All operations are O(1) time. Space is O(n).

## Edge cases

- Dequeuing the last item must reset **both** `head` and `tail`, otherwise the next `enqueue` links onto a detached node.
- `dequeue`/`front`/`back` on an empty queue return `undefined`.
- `undefined` is a legal item, so emptiness is tracked by the counter, not by the value.

## Talking through it in an interview

Start by naming the trap: "an array with `shift` is O(n) per dequeue". Then draw the two pointers and walk through three states: empty, one item, many items. The one-item case is where most bugs hide. Finish with complexity and the alternatives.

## Follow-ups

- **Ring buffer:** a fixed array of capacity `c`, with `head` and `size`. The back index is `(head + size) % c`. Great for bounded logs.
- **Where queues show up in front-end work:** BFS over the DOM, request schedulers that limit concurrency, the task and microtask queues in the event loop, toast/snackbar managers.
