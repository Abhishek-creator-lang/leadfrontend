## Approach

Split the problem into a **data pipeline** and a **rendering step**. Most bugs in this question come from mixing the two.

### 1. Prepare the list

```js
let list = items.filter((item) => item !== '');
if (unique) list = [...new Set(list)];
if (sorted) list = [...list].sort();
```

- Filtering first means empty strings never count toward `length` or "others".
- `new Set` keeps first occurrences in order.
- Sorting a **copy** keeps the caller's array untouched. (`filter` already produced a copy, so `list.sort()` would also be safe here; being explicit avoids a bug if the order of steps changes later.)

### 2. Decide what's visible

```js
const truncate = length > 0 && length < list.length;
const shown = truncate ? list.slice(0, length) : list;
const hidden = list.length - shown.length;
```

### 3. Render

Build the final "parts" array, then join it:

- If `hidden > 0`, the last part is `` `${hidden} other${hidden === 1 ? '' : 's'}` `` and every shown item comes before it.
- With 0 parts return `''`; with 1 part return it; otherwise `parts.slice(0, -1).join(', ') + ' and ' + parts.at(-1)`.

Treating "N others" as just another part means one join rule covers every case: `'Ana and 1 other'`, `'Ana, Ben and 2 others'` and `'Ana, Ben and Cy'` all fall out of the same code.

## Complexity

O(n log n) when sorting, O(n) otherwise. O(n) space for the working copy.

## Edge cases

- Only empty strings: `''`.
- `length: 0`, negative, or `>= count`: ignored, so the full list is shown.
- `length: 1` on two items: `'Ana and 1 other'`.
- `unique` plus `length`: duplicates are removed **before** counting, so they don't inflate "others".

## Common mistakes

| Mistake | Consequence |
|---|---|
| Counting empty strings in "others" | `'Ana and 1 other'` for `['Ana', '']` |
| Applying `length` before `unique` or `sorted` | Shows the wrong names and wrong counts |
| `items.sort()` | Mutates the caller's array (and React state if that's where it came from) |
| Always writing `others` | `'1 others'` |
| Special-casing 1, 2, 3+ items separately for the truncated and non-truncated paths | Six branches, and one of them is always wrong |

## `Intl.ListFormat` and localisation

`new Intl.ListFormat('en-GB', { style: 'long', type: 'conjunction' }).format(['Ana', 'Ben', 'Cy'])` gives `'Ana, Ben and Cy'` (en-US adds the Oxford comma). It handles conjunctions and separators for every locale, but it doesn't de-duplicate, sort, truncate or produce "N others". In production, combine it with:

- `Intl.PluralRules` (or ICU MessageFormat in your i18n library) for "other/others". Languages such as Polish and Arabic have more than two plural categories, so a `count === 1` check isn't enough.
- `Intl.Collator` or `localeCompare` for sorting: `['bob', 'Zed'].sort()` gives `['Zed', 'bob']` because uppercase letters sort before lowercase in UTF-16. `list.sort(new Intl.Collator(locale).compare)` gives what users expect, and handles accents.

## Follow-ups interviewers ask

- **React rendering:** return an array of nodes rather than a string, so names can be links and "2 others" can be a button that opens the full list.
- **Accessibility:** if "2 others" is a button, its accessible name should say what it does ("Show 2 more people who liked this").
- **Performance:** for a huge list of names, avoid sorting everything when only the first `length` are shown; a partial selection (heap) is O(n log k).
