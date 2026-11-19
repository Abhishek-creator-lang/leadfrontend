A word-game app needs to show which of the player's guesses use exactly the same letters. Write `groupAnagrams(words)`, which groups words that are **anagrams** of each other: same letters, same counts, any order.

```js
groupAnagrams(['listen', 'stone', 'silent', 'notes', 'enlist', 'apple', 'onset']);
// [
//   ['listen', 'silent', 'enlist'],
//   ['stone', 'notes', 'onset'],
//   ['apple'],
// ]
```

## Requirements

- Every input word appears in exactly one group (duplicates included: `['ab', 'ab']` → `[['ab', 'ab']]`).
- The order of the groups, and of words within a group, doesn't matter.
- Words contain lowercase letters `a`–`z` only. The empty string is a valid word.

## Constraints

- Up to 10⁴ words, each up to 100 characters.
- Comparing every pair of words is too slow. Aim for roughly O(n · L log L) or better.

## Follow-up

- Can you build the grouping key in O(L) instead of O(L log L)?
- How would you handle Unicode letters, or ignore case and spaces ("Dormitory" vs "dirty room")?
