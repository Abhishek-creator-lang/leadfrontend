## Approach

A JavaScript array already behaves like a stack when you only touch its **end**: `Array.prototype.push` and `pop` are amortised O(1) because nothing has to shift. The class is a thin wrapper that hides the array so callers can't reach into the middle of it.

Wrapping it is still worthwhile in an interview because it:

1. Narrows the API to LIFO operations only.
2. Gives `pop`/`peek` defined behaviour (`undefined`) on an empty stack.
3. Keeps the storage private (here with a `#items` private field), so each instance has its own array.

## Brute force vs optimal

There isn't really a brute force here, but a common slip is to use `unshift`/`shift` on the **front** of the array. Those are O(n) because every other element has to move. Always grow and shrink from the end.

## Complexity

| Operation | Time | Space |
|---|---|---|
| `push` | O(1) amortised | O(1) |
| `pop`, `peek`, `isEmpty`, `length` | O(1) | O(1) |

Total space is O(n) for n items.

## Edge cases

- `pop()`/`peek()` on an empty stack return `undefined` rather than throwing.
- Storing `undefined` as an item is legal, so `isEmpty` must check the length, not whether `peek()` is `undefined`.
- Two stacks must not share an array. Declaring the array as a class field (not on the prototype) avoids that.

## Talking through it in an interview

State the invariant first: "the top of the stack is the last element of the array". Then every method follows from that sentence. Mention amortised O(1) for `push` (the engine occasionally reallocates the backing store) and that you deliberately avoid the front of the array.

## Follow-ups

- **O(1) `min()`:** keep a second stack where each entry is the minimum so far. Push `Math.min(item, minStack.top)` on every push and pop both stacks together.
- **Bounded history:** a stack that drops its *oldest* entry when full is really a ring buffer, because you need O(1) removal at the bottom.
- **Where stacks appear in front-end work:** undo/redo (two stacks), the JS call stack, matching brackets or HTML tags, iterative DFS over the DOM.
