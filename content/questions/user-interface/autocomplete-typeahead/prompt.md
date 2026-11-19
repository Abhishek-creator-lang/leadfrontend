Build an `Autocomplete` input that suggests countries as the user types, like the search box on a travel site.

## The API

`api.js` exports `searchCountries(query, { signal })`, which returns a `Promise<{ id, name }[]>` (max 8 results). It **stands in for a real endpoint** such as `GET /api/countries?q=ind&limit=8` so the exercise works offline. It behaves like a real network call in the ways that matter:

- It takes 60–260 ms, and **shorter queries are slower**, so responses can come back out of order.
- It accepts an `AbortSignal` and rejects with an `AbortError` when aborted, just like `fetch`.
- The query `error` makes it reject, so you can build an error state.

A real endpoint would also need `fetch` + `response.ok` checks, JSON parsing, auth headers, rate limits (HTTP 429) and server-side relevance ranking, but the component shouldn't care: it receives `search` as a prop.

## Requirements

1. Typing shows up to 8 suggestions in a popup below the input. Don't call the API on every keystroke: **debounce** (about 200 ms).
2. **Race conditions:** results must always correspond to the latest query, even if an older request resolves later.
3. Show a "Loading…" state, a "No results" state and an error state.
4. Highlight the part of each suggestion that matches the query.
5. Selecting a suggestion (click or keyboard) puts its name in the input, closes the popup and calls `onSelect(item)`.
6. Cache results per query so retyping a previous query is instant.
7. Accessibility, following the WAI-ARIA **combobox** pattern (list autocomplete):
   - The input has `role="combobox"`, `aria-expanded`, `aria-controls` (the listbox) and `aria-autocomplete="list"`, and a visible label.
   - Suggestions are `role="option"` inside a `role="listbox"`.
   - **Focus stays in the input.** <kbd>↓</kbd>/<kbd>↑</kbd> move a virtual "active" option, exposed with `aria-activedescendant` and `aria-selected`. <kbd>Enter</kbd> selects it. <kbd>Escape</kbd> closes the popup.
   - The number of results (or the empty/error state) is announced through a live region.

## Follow-up

- How would you test the race condition?
- Support free text (submit what was typed even if it isn't in the list).
- Grouped results (Countries / Cities) and recent searches when the input is empty.
