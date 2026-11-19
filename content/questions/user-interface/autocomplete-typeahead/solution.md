## Architecture

- `Autocomplete` is a reusable component that receives `search(query, { signal })` as a prop. It doesn't know about countries or `fetch`, so it can be reused and tested with any data source.
- `useDebouncedValue(value, delay)` is a tiny hook: the input stays instant (controlled `query`), while the *search* runs on a debounced copy.
- `Highlight` renders the matching substring in a `<mark>`. It slices strings rather than injecting HTML, so user input can never become markup (no XSS from `dangerouslySetInnerHTML`).

## State design

| State | Purpose |
|---|---|
| `query` | What's in the input (updates on every keystroke) |
| `debouncedQuery` | Drives fetching |
| `results`, `status` | Last successful results and `idle / loading / success / error`. A status enum avoids impossible combinations like `loading && error` |
| `open` | Whether the popup is wanted (focus, typing, Escape, selection) |
| `activeIndex` | Virtual focus inside the list (`-1` = none) |
| `cache` (ref) | `Map<query, results>`. A ref, because changing it shouldn't re-render |

`showList` is derived: `open && query && results.length > 0`. `aria-expanded` uses the same value, so the attribute can never disagree with what's on screen.

## Async correctness

This is the part interviewers probe hardest.

1. **Debounce.** The effect depends on `debouncedQuery`, so typing "germany" makes one request, not seven.
2. **Race conditions.** Even with debouncing, a slow request for `c` can resolve after a fast request for `germ`. Each effect run creates an `AbortController`. The cleanup function (which React runs before the next effect run and on unmount) aborts it. Aborted promises reject with `AbortError`, which we ignore. So a stale response can never call `setResults`. The mock API is deliberately slower for short queries to make this bug visible.
   - Without `AbortController`, the same guarantee comes from a local `let ignore = false` set to `true` in cleanup (the pattern in the React docs). Aborting is better because it also cancels the network request.
3. **Caching.** Results are cached per normalized query (trimmed, lower-case). Retyping or backspacing to an earlier query is instant and doesn't hit the server. In production you'd bound the cache (LRU) and give it a TTL.
4. **Strict Mode** mounts effects twice in development. Our effect is safe because cleanup aborts the first request.
5. The tests use real timers and `findBy*`/`waitFor`; the race test types a slow query, waits for its request to be in flight, types a fast one and asserts the slow response never appears.

## Accessibility (APG combobox with listbox popup)

- `<input role="combobox">` with a `<label>`, `aria-autocomplete="list"`, `aria-controls` and `aria-expanded`.
- **DOM focus never leaves the input.** That's what makes typing and arrowing feel seamless. The highlighted option is communicated with `aria-activedescendant` (pointing at the option's id) plus `aria-selected="true"` on that option. IDs come from `useId`.
- Keys: <kbd>↓</kbd> opens or moves down (wrapping), <kbd>↑</kbd> moves up, <kbd>Enter</kbd> selects the active option (and only then calls `preventDefault`, so a surrounding form can still submit), <kbd>Escape</kbd> closes, and a second <kbd>Escape</kbd> clears the input.
- Mouse: options call `preventDefault` on **`mousedown`**. Otherwise the input blurs first, `onBlur` closes the list, and the click lands on nothing. That's the classic autocomplete bug.
- A `role="status"` live region announces "5 results available", "No results" or the error. When the list is visible the message is visually hidden but still announced.
- `autoComplete="off"` stops the browser's own suggestions from covering ours.
- In production, scroll the active option into view (`scrollIntoView({ block: 'nearest' })`) for long lists, and make sure the active style works in Windows High Contrast (`forced-colors`).

## Edge cases

- Whitespace-only queries don't search.
- Clearing the input clears results immediately rather than showing stale ones.
- Results from the previous query stay visible while the new one loads (less flicker). Some teams prefer to dim them; mention it.
- Selecting an item sets the input to its name, which triggers one more (cached or harmless) search, but the popup stays closed because `open` is false.
- Unmounting mid-request aborts it, so there's no "state update on unmounted component".

## Production and scale

- Put fetching behind a data layer (React Query/SWR or a small hook) for dedupe, caching, retries and stale-while-revalidate. In React 19 you might reach for `useDeferredValue` or transitions to keep typing responsive while rendering large result lists.
- Server: prefix index or search engine, return ranked results with highlight ranges (better than highlighting on the client for fuzzy matches and diacritics).
- Rate limiting: debounce plus a minimum query length (often 2 characters) for expensive endpoints.
- Analytics: log the query and chosen position to improve ranking.
- Virtualize if you ever show hundreds of options.

## Follow-ups

- **Free text:** on Enter with no active option, submit `query` as-is.
- **Inline autocomplete** (`aria-autocomplete="both"`): type-ahead completion inside the input, with the completed part selected.
- **Multi-select chips:** selected items become removable tokens; Backspace on an empty input removes the last one.
