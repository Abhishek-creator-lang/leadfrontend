## Brute force

Generate every simple path on the grid of length `L` and compare each with the word. The number of paths explodes (up to about `R·C·4·3^(L-1)`), and most are thrown away at the very end, long after the first letter mismatched.

## Optimal approach: DFS backtracking with early exit

Try every tile as a starting point. From a tile at `(r, c)` matching `word[i]`:

1. If `i` is the last index, you're done.
2. Mark the tile as **in use** for the current path.
3. Recurse into the four neighbours with `i + 1`. Return `true` as soon as one succeeds.
4. **Unmark** the tile on the way out (that's the backtracking), so other paths can use it.

The key difference from brute force is that the DFS abandons a path **the moment a letter doesn't match**, so most branches die after one or two steps.

The reference uses a `Uint8Array` "in use" mask instead of overwriting board letters with `'#'`. The overwrite trick is common, but it mutates caller data, and if an exception escapes mid-search the board stays corrupted.

## Pruning

- **Letter-count check:** if the board has fewer of some letter than the word needs, return `false` before searching. This kills adversarial cases like a board full of `A` with the word `AAAA…AB`.
- **Search from the rarer end:** if the last letter is rarer on the board than the first, reverse the word. That gives fewer starting points and earlier failures.
- **Length check:** a word longer than `R × C` can't fit.

## Complexity

- **Time:** O(R · C · 3^L) in the worst case. Each step has at most 3 new directions, because you can't go back. Pruning makes typical cases far faster, but the worst case remains exponential in L. That's inherent to the problem.
- **Space:** O(L) recursion depth plus the O(R · C) mask.

## Edge cases

- Single-letter word.
- Word needing to reuse a tile → must fail.
- Word longer than the board.
- Repeated letters (`HOOK`) where the order of trying neighbours matters. Backtracking handles it.

## Talking through it in an interview

Describe the DFS with mark/unmark first. Interviewers mostly check that you restore state correctly. Then add pruning and explain the worst case honestly. Mention that you avoid mutating the board, and why.

## Follow-ups

- **All dictionary words (Boggle):** build a *Trie* of the dictionary and DFS the board once, walking the trie in parallel. A branch stops as soon as the trie has no child for the current letter. Remove found words from the trie to prune further.
- **Diagonals allowed:** use 8 directions instead of 4; the same code otherwise.
- **UI:** highlight the found path. Have the DFS return the stack of coordinates instead of a boolean.
