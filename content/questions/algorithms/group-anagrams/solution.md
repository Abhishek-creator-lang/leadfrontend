## Brute force

For each word, compare it with every existing group's representative using an "is anagram" check (sort both, or count letters). With n words and g groups that's O(n · g · L), which becomes O(n² · L) when most words are unique. 10⁴ words gives about 10⁸ comparisons of 100-character strings, which is too slow.

## Optimal: a canonical key + hash map

Anagrams share a **canonical form**. Map each word to that form and use it as a key into a `Map` of groups:

- **Sorted letters:** `'listen'` and `'silent'` both become `'eilnst'`. That costs O(L log L) per word.
- **Letter counts (reference):** count the 26 letters into an array and join it (`'1,0,0,…'`). O(L) per word, and the key length is fixed. Joining with a separator is essential, otherwise counts like `1,11` and `11,1` collide.

Then:

```js
const key = keyOf(word);
if (!groups.has(key)) groups.set(key, []);
groups.get(key).push(word);
```

Finally return `[...groups.values()]`.

## Complexity

- **Sorted-key version:** O(n · L log L) time.
- **Count-key version:** O(n · (L + 26)) time.
- **Space:** O(n · L) for the groups and keys.

## Edge cases

- Empty string: its key is valid (all zeros, or `''`), so empty strings group together.
- Duplicate words go in the same group.
- Words of different lengths can never be anagrams. The key handles that automatically.
- Use a `Map`, or an object created with `Object.create(null)`: a key like `'constructor'` is impossible here, but in general a plain object's prototype can bite you.

## Talking through it in an interview

The key insight is "anagram-equivalence is an equivalence relation, so find a canonical representative". Say that, show both key options, and pick one depending on word length and alphabet size. Mention why the separator matters for count keys.

## Follow-ups

- **Unicode / case / spaces:** normalise first (`word.normalize('NFC').toLowerCase().replace(/\s+/g, '')`), then sort code points (`[...w].sort().join('')`), because the 26-slot array no longer works.
- **Prime-product key:** assign each letter a prime and multiply. It's elegant, but it overflows quickly. Mention it as a curiosity, not a solution.
- **Similar grouping problems in UI work:** de-duplicating search terms, clustering similar file names, and grouping list items by a computed key (`Object.groupBy` / `Map.groupBy`, added in ES2024).
