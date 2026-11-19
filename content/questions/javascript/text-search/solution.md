## Approach

Treat this as an **interval** problem: find all match ranges, merge them, then render. Trying to insert tags while searching breaks as soon as matches overlap (you end up searching inside text you've already modified, or nesting `<b>` tags).

### 1. Find every match

Lower-case the text and each word once. For each word, call `indexOf` repeatedly, starting each new search at `index + 1` (not `index + word.length`) so overlapping matches like `'aa'` in `'aaa'` are found.

`indexOf` takes the query literally, so `.` and `$` need no escaping. If you used a `RegExp`, you'd have to escape the word first (`RegExp.escape` exists in newer engines, otherwise a manual replace), and a global regex skips overlapping matches anyway.

### 2. Mark or merge

Two equivalent options:

- **Boolean mask** (used in the reference solution): an array the length of the text, set `true` for every character covered by a match. Merging is automatic, because overlapping or adjacent ranges simply produce a continuous run of `true`.
- **Interval merge:** collect `[start, end)` pairs, sort by start, merge when `next.start <= current.end`. This uses less memory when matches are sparse in a huge text.

### 3. Render

Walk the text once. Open `<b>` when a run of marked characters begins and close it when the run ends (including at the end of the string).

## Complexity

With text length n, w words, and average word length m:

- `indexOf` scans: roughly O(w × n × m) in the worst case, O(w × n) typically.
- Mask and render: O(n) time and space.

## Edge cases

- Empty or whitespace-only query: no words, return the text unchanged.
- Repeated words in the query (`'a a'`) don't matter: marking twice is idempotent.
- A word longer than the text simply never matches.
- Case: `toLowerCase` can change string length for a few characters (for example `'İ'` becomes two code units), which would misalign indices. For a production version, compare with `localeCompare(…, { sensitivity: 'base' })` per window, or normalise in a length-preserving way. Mention it; don't implement it unless asked.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `text.replace(new RegExp(word, 'gi'), …)` per word | Regex metacharacters break it, and the second word matches inside `<b>` tags inserted by the first |
| Advancing by `word.length` after a match | Misses overlapping matches (`'aa'` in `'aaa'`) |
| Merging only overlapping, not touching ranges | `'<b>foo</b><b>bar</b>'` instead of `'<b>foobar</b>'` |
| Lower-casing the output | Loses the user's original casing |
| Forgetting to close the final `<b>` when the text ends inside a match | Unbalanced markup |

## In React

Returning an HTML string and passing it to `dangerouslySetInnerHTML` is an XSS hole when the text comes from users. Instead, return segments, for example `[{ text: 'The ', match: false }, { text: 'quick', match: true }, …]`, and render them as text nodes and `<mark>` elements. `<mark>` is the semantic element for search highlights, and screen readers in some configurations announce it.

## Follow-ups interviewers ask

- **Accent-insensitive search:** normalise both strings with `normalize('NFD')` and strip combining marks (`/\p{Diacritic}/gu`), keeping a map from normalised indices back to original indices because the lengths change.
- **Many words, big text:** Aho–Corasick finds all words in one O(n + total matches) pass. Simpler wins first: debounce the input, and highlight only the visible rows of a virtualised list.
- **Whole-word matching:** check that the characters before and after a match aren't letters (`/\p{L}/u`).
