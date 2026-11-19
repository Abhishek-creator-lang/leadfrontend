## Brute force

Repeatedly delete adjacent matching pairs (`()`, `[]`, `{}`) after stripping out non-bracket characters, until nothing changes. The string is balanced if it ends up empty. Each pass is O(n) and there can be O(n) passes (`((((…))))` removes one pair per pass), so it's O(n²). That's far too slow for a megabyte of code.

## Optimal: a stack of open brackets

The most recently opened bracket must be the first one closed. "Last in, first out" means a stack.

1. Walk the string once.
2. Opening bracket → push the **closing** bracket we now expect. Pushing the expected closer makes the check a simple equality.
3. Closing bracket → pop. If the stack was empty, or the popped value isn't this character, return `false`.
4. Any other character → ignore it.
5. At the end, the string is balanced only if the stack is **empty**. Leftover openers were never closed.

A lookup object (`{ '(': ')', '[': ']', '{': '}' }`) plus a set of closers keeps the loop short and makes it easy to add `<>` later.

## Complexity

- **Time:** O(n), one pass.
- **Space:** O(n) in the worst case (all openers).

## Edge cases

- Empty string, or a string with no brackets → `true`.
- A closer with an empty stack (`")("`) → `false` immediately.
- Openers left at the end (`"{ open"`) → `false`.
- Interleaving of the right counts but wrong order (`"([)]"`) → `false`. Counting alone would wrongly accept this.

## Talking through it in an interview

Start with the counter idea for a single bracket type, then show `"([)]"` to explain why counters aren't enough with several types. That motivates the stack naturally. Mention the "push the expected closer" trick, and remember the final emptiness check, which is the most commonly forgotten line.

## Follow-ups

- **Error position:** push indices along with the expected closer. On a mismatch, report the current index; at the end, report the index of the first unclosed opener still on the stack.
- **One bracket type:** a single integer depth counter is enough: increment, decrement, fail if it goes negative, and require 0 at the end. O(1) space.
- **Real editors** also have to skip brackets inside strings, template literals, regexes and comments, which needs a tokenizer. In practice, editors maintain bracket pairs incrementally so they don't rescan the whole file on every keystroke.
- **Same pattern elsewhere:** validating HTML tag nesting, undo groups, and parsing JSON or expressions.
