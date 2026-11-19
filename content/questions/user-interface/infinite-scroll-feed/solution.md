## Architecture

```
App
├─ useFeed(pageSize)      → { items, status, announcement, loadMore }
├─ <div role="feed">      articles (aria-posinset / aria-setsize), PageUp/PageDown
├─ sentinel <div>         watched by IntersectionObserver → loadMore()
└─ footer                 spinner | alert + Retry | Load more | "all caught up"
```

All the data logic lives in a custom hook, so the view only reads `status` and `items`. That split makes it easy to swap the mock for real `fetch` or a TanStack Query `useInfiniteQuery` later without touching the markup.

## State design

| Value | Where | Why |
|---|---|---|
| `items` | state | Rendered |
| `status`: `'loading' \| 'idle' \| 'error' \| 'done'` | state | One enum instead of `isLoading` + `hasError` + `hasMore` booleans that can contradict each other |
| `cursor` | **ref** | Async code needs the latest value. The UI never renders it. |
| in-flight request | **ref** (`AbortController`) | Both the concurrency guard and the abort handle |

### Why refs for the guard?

`loadMore` can be called twice in the same tick: two quick clicks, or the observer firing as the user scrolls. If the guard checked `status === 'loading'`, both calls would see the old `'idle'` from their closure and fire two requests for the same cursor, producing duplicate posts. A ref changes **synchronously**, so the second call sees the first request and returns. The test "double-clicking Load more does not duplicate posts" covers this.

### Cancellation and Strict Mode

The mount effect calls `loadMore()`, and its cleanup aborts the in-flight controller. In development, Strict Mode mounts, unmounts and remounts. The first request is aborted (its `AbortError` is swallowed), and the second one proceeds. The `finally` clears the ref only if it still points at *this* request's controller, so a stale request finishing late can't clear a newer one. That's the same race-condition discipline you need for search-as-you-type.

## Triggering loads: IntersectionObserver

A 1-px sentinel after the list is observed with `rootMargin: '300px 0px'`, so loading starts *before* the user reaches the bottom.

- **Not a `scroll` listener:** scroll events fire dozens of times per frame and need throttling plus `getBoundingClientRect()`, which forces layout. IntersectionObserver is asynchronous and off the main-thread hot path.
- The observer is created only while `status === 'idle'` and torn down otherwise. If a page is too short to fill the screen, the sentinel is *still* visible after it loads. Re-observing on the next `idle` fires again immediately, so the screen fills itself.
- **Fallbacks:** if `IntersectionObserver` is undefined (old browsers, jsdom), the visible **Load more** button still works.

## Accessibility: the APG feed pattern

- `role="feed"` on the container and an `<article>` per post, each `aria-labelledby` its title, with `aria-posinset` and `aria-setsize`. `aria-setsize` is `-1` while the total is unknown, and the real count once the end is reached.
- `aria-busy="true"` while loading tells screen readers to wait for the DOM to settle before announcing changes.
- Articles are focusable (`tabindex="0"`). <kbd>Page Down</kbd>/<kbd>Page Up</kbd> move focus between them, per the pattern.
- **Load more button:** infinite scroll is notoriously hostile to keyboard users (the footer keeps running away) and to people with motor impairments. An explicit button makes the feed operable without scrolling and reaches the same code path.
- The `role="status"` region announces "Loaded 10 more posts". Errors use `role="alert"`, with a Retry button that retries the **same** cursor, because the cursor only advances on success.

## Edge cases

- **Duplicates:** cursor pagination (`after: <lastId>`) keeps pages stable when new posts are inserted at the top. Offset pagination (`?page=3`) would shift every item and duplicate one. For extra safety, dedupe by `id` when merging.
- **Empty first page:** `nextCursor` is null, so it shows "all caught up". A real product shows a dedicated empty state instead.
- **Unmount mid-request:** the request is aborted and no state update happens.
- **Errors mid-feed:** posts already loaded stay. Only the footer changes.

## Performance at scale

- **Long lists:** after a few thousand posts, the DOM gets heavy (style recalc, memory). Options, in increasing effort:
  1. `content-visibility: auto` with `contain-intrinsic-size` (already in the CSS): the browser skips layout and paint for off-screen posts.
  2. **Windowing / virtualisation:** render only the visible slice, measuring variable heights (see the virtualized-list question). For a feed, keep the article semantics and `aria-posinset` on the rendered subset, which is exactly why the feed pattern has those attributes.
  3. Cap the cache: drop pages far above the viewport and refetch them on scroll-up.
- **Memoisation:** a `React.memo` `Post` component keeps appended pages from re-rendering existing posts.
- **Images:** `loading="lazy"`, explicit dimensions to avoid layout shift, and `srcset`.

## Productionising

- A server-cache library (`useInfiniteQuery`) gives you caching, dedupe, background refetch and retry with backoff.
- **Scroll restoration:** keep the loaded pages in a cache keyed by the feed, and restore `scrollY` (or an anchor post id) on back-navigation.
- **New posts while reading:** don't insert at the top under the user. Show a "5 new posts" pill and insert when it's clicked, preserving scroll position by anchoring to the first visible post.
- **Observability:** log page latency and errors. Track how deep users scroll to tune the page size and `rootMargin`.

## Follow-ups

- *"Why `useRef` for the cursor and not state?"* It isn't rendered, and async code needs the latest value without stale closures.
- *"What's the difference between `aria-busy` and a spinner?"* The spinner is visual. `aria-busy` changes how assistive tech handles updates to the region.
- *"How would you test the scroll trigger?"* Mock `IntersectionObserver` and call its callback with `isIntersecting: true`, or test with Playwright in a real browser.
