## Brute force

Keep the words in an array and filter with `word.startsWith(prefix)` on every keystroke. That's O(N · L) per query for N words. It's fine for 200 commands but sluggish for 200,000 product names, and it re-scans everything on every keystroke.

## Optimal: a prefix tree

Each node has:

- `children`: a `Map` from character to child node (a `Map` handles any character, unlike a fixed 26-slot array);
- `isWord`: whether a stored word ends here.

Every operation walks the word one character at a time:

- **`insert`:** create missing children along the path and set `isWord` on the last node. If it was already `true`, the word is a duplicate.
- **`has`:** walk the path; the word exists only if the path exists **and** the final node has `isWord`. That second check is what separates `has('open')` from `hasPrefix('open')`.
- **`hasPrefix`:** the path just has to exist.
- **`complete`:** walk to the prefix's node, then DFS beneath it, collecting words. Visiting children in sorted key order produces the results already sorted, with no extra sort step.
- **`remove`:** walk the path, remembering the nodes. Clear `isWord`, then **prune** from the bottom up: delete child links for nodes that are no longer words and have no children. This stops dead branches from making `hasPrefix` lie.

## Complexity

- `insert`, `has`, `hasPrefix`, `remove`: O(L).
- `complete`: O(P + K), where P is the prefix length and K the total size of the subtree under the prefix (plus sorting the child keys at each node).
- Space: O(total characters) in the worst case, less where prefixes are shared.

## Edge cases

- A word that is a prefix of another (`open` / `open file`). Removing one must not remove the other.
- Removing a word that's only a prefix → `false`.
- An empty prefix completes to every word.
- Unicode and punctuation: `for…of` over a string iterates code points, so it's fine either way as long as insert and lookup use the same iteration.

## Talking through it in an interview

Draw a few words sharing a prefix, mark the `isWord` flags, and walk through `has` vs `hasPrefix`. Explain pruning in `remove`; many candidates skip it, which is why the interviewer asks.

## Follow-ups

- **Ranking:** store a frequency on each word node and keep a small "top-k" list cached at each node, updated on insert. Queries then become O(P).
- **Sorted array alternative:** binary-search the first word `≥ prefix` and read forward while it matches. It's compact and fast for static lists, but inserts are O(N). Tries win when the dictionary changes or prefixes are heavily shared.
- **Radix / compressed tries** merge single-child chains to save memory. Routers (matching URL path segments) use the same idea.
