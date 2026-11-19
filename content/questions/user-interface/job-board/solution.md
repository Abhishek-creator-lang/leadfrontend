## The data flow

The Hacker News API is deliberately "chatty": one request for the list of ids, then **one request per item**. The UI paginates over the id list:

```
mount ──► fetchJobIds() ─► ids (cached in a ref, fetched once)
      └─► Promise.all(ids[0..6].map(fetchJob)) ─► append page
"Load more" ─► Promise.all(ids[6..12].map(fetchJob)) ─► append page
```

- **Parallel, not sequential:** `await` in a `for` loop would make 6 round trips back to back (~6× slower). `Promise.all` fires all 6 at once.
- **Render a page atomically:** waiting for the whole page avoids cards appearing in random order as individual requests resolve. The trade-off is that one slow item delays the page. A follow-up is `Promise.allSettled`, which renders the jobs that succeeded and drops or retries the rest.
- **Cache the ids:** they're fetched once and reused for every page. Refetching them on each "Load more" would shift offsets if new jobs were posted in between, which can duplicate or skip jobs.

## State design

| Value | Kind | Why |
|---|---|---|
| `jobs` | state | Rendered |
| `status`: `loading \| idle \| error` | state | Drives the button, spinner and alert |
| `hasMore` | state | Hides the button |
| `announcement` | state | Live region text |
| `idsRef`, `offsetRef` | refs | Read synchronously by async code, never rendered directly |
| `busyRef` | ref | Concurrency guard |
| `mountedRef` | ref | Prevents updates after unmount |

The offset advances **only on success**. So Retry is just "call `loadNextPage` again": if the ids failed, it refetches the ids; if a page failed, it refetches that page. One function handles both cases.

The offset tracks *ids consumed*, not `jobs.length`, because deleted items (`null`) are filtered out. Using `jobs.length` as the offset would re-request ids after any page that contained a deleted job.

## Race conditions and lifecycle

- **Double click:** `busyRef` is set synchronously, so the second click returns before starting a duplicate request for the same offset. Checking `status === 'loading'` isn't enough, because both handlers can run before React re-renders.
- **Strict Mode:** the mount effect runs twice in development. The busy guard turns the second call into a no-op, and the first call's results still land, because `mountedRef` is reset to `true` on the remount.
- **Unmount mid-request:** results are dropped when `mountedRef` is false. With real `fetch`, prefer an `AbortController` per load and abort it in cleanup. That also cancels the network work, not just the state update.

## Accessibility

- A semantic `<ul>` of `<article>`s, each labelled by its `<h2>` title, so screen-reader users can jump between headings or list items.
- External links open in a new tab, with `rel="noopener noreferrer"` and hidden text "(opens in a new tab)" (WCAG 3.2.5 advisory). Self-posts without a URL render plain titles rather than dead links.
- `<time dateTime="ISO">` with a locale-formatted label (`Intl.DateTimeFormat`), so machines get ISO and people get their own format.
- **Load more** uses `aria-disabled` while loading, not `disabled`. Disabling the focused button would drop keyboard focus to `<body>`, and the user would have to tab all the way back. New items are appended *after* the existing ones, so focus stays put, and a polite `role="status"` announces "Loaded 6 more jobs".
- Errors use `role="alert"` with a Retry button.

## Productionising

- **Server cache:** TanStack Query or SWR with `useInfiniteQuery`, plus `staleTime`. Going back to the board then renders instantly from the cache. Without a library, lift the cache into a module-level `Map` keyed by id.
- **BFF / aggregation:** 1 + N requests per page is slow on mobile networks. A small backend-for-frontend endpoint `GET /jobs?cursor=…&limit=6` returning full items cuts it to one request per page and lets you cache at the edge.
- **Search and filters** need the server too. Filtering a client-side id list means fetching every item first.
- **Error policy:** retry with exponential backoff for transient failures. Use `allSettled` so a single deleted or failing item doesn't block the page.
- **Rendering:** a `React.memo` `JobCard` keeps old cards from re-rendering on each append. For hundreds of items, consider virtualisation, or simply cap how many are loaded.

## Edge cases

- Fewer than 6 jobs left: `slice` returns what remains, and `hasMore` becomes false.
- Zero jobs: show an empty state (the solution would show nothing; mention it).
- Time is in **seconds**: `new Date(time)` without `* 1000` gives dates in 1970, which is a classic bug.

## Follow-ups

- *"Why not fetch all 200 items up front?"* 200 requests on load is wasteful, rate-limit-prone and slow on mobile. Paginate.
- *"Infinite scroll instead of a button?"* Observe a sentinel with `IntersectionObserver`, but keep the button for keyboard users (see the infinite-scroll-feed question).
- *"How would you test it?"* Mock the API module (as here) and assert on roles: `article` counts, `link`s, the alert, the button's `aria-disabled`.
