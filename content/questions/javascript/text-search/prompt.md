Implement `textSearch(text, query)`, the highlighting step of a search box. It returns `text` with every match of the query wrapped in `<b>` and `</b>`.

```js
textSearch('The quick brown fox', 'quick'); // 'The <b>quick</b> brown fox'
textSearch('The Quick brown fox', 'quick'); // 'The <b>Quick</b> brown fox'
textSearch('aaa', 'aa'); // '<b>aaa</b>'           (overlapping matches merge)
textSearch('foobar', 'foo bar'); // '<b>foobar</b>'  (adjacent matches merge)
textSearch('one two three', 'one three'); // '<b>one</b> two <b>three</b>'
textSearch('price: $5.00', '5.0'); // 'price: $<b>5.0</b>0'
textSearch('hello', ''); // 'hello'
```

## Requirements

- The query is split on whitespace into **words**. Empty words are ignored. Each word is searched for on its own.
- Matching is **case-insensitive**, but the output keeps the original casing from `text`.
- Find **every** occurrence of each word, including overlapping ones.
- The highlighted regions are the union of all matches. Regions that **overlap or touch** (one ends exactly where the next begins) become a single `<b>…</b>`.
- Query characters are literal. `.` or `$` in the query match only themselves.
- If nothing matches, or the query has no words, return `text` unchanged.
- You don't need to HTML-escape `text`; assume it's plain text with no `<` or `&`.

## Follow-up

- In React, why should you not render this result with `dangerouslySetInnerHTML`? What would you return instead?
- How would you make `cafe` match `café`?
- The text is 1 MB and the query has 20 words. What's the cost of your approach, and how would you improve it?
