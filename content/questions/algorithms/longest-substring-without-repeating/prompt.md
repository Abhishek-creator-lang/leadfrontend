A password-strength meter rewards long stretches of characters that don't repeat. Write `longestUniqueRun(text)`, which returns the length of the longest **contiguous** substring of `text` in which no character appears twice.

```js
longestUniqueRun('abcabd');      // 4  ("cabd")
longestUniqueRun('mississippi'); // 3  ("mis")
longestUniqueRun('aaaa');        // 1
longestUniqueRun('');            // 0
longestUniqueRun('Ab1!aB');      // 6  (case-sensitive: 'A' and 'a' differ)
```

A *substring* is contiguous. In `'abcabd'`, the letters `a b c d` are all distinct, but they never appear next to each other as a block, so the answer is 4 because of `"cabd"`, not because of them.

## Constraints

- `text` can be up to 10⁵ characters of any kind (letters, digits, symbols, spaces).
- Comparisons are case-sensitive.
- Aim for O(n) time.

## Follow-up

- Return the substring itself, not just its length.
- What if each character could appear up to `k` times?
