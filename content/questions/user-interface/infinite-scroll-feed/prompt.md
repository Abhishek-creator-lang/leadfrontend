Build a social-style **feed** that loads posts in pages and fetches the next page automatically as the user scrolls near the bottom.

`api.js` provides `fetchPosts({ cursor, limit, signal })`, a **mock** that stands in for a real endpoint such as `GET /api/posts?cursor=…&limit=10`. It resolves to `{ items, nextCursor }` after a short delay, where `nextCursor` is `null` on the last page (34 posts in total), and rejects with an `AbortError` when its signal is aborted. Set `mockOptions.failRate` to simulate network errors.

A real endpoint differs in ways your code should be ready for. It returns JSON over `fetch` (check `response.ok` yourself), the cursor is an opaque string, latency and failures vary, and new posts can be inserted at the top while you page. Cursor pagination, rather than `?page=3`, is what keeps that last case from producing duplicates.

## Requirements

1. On mount, load the first page (10 posts). Show a loading indicator while any page is loading.
2. When a sentinel element near the end of the list scrolls into view, load the next page (use `IntersectionObserver`). Also render a visible **Load more** button: it's the keyboard and fallback path, and environments without `IntersectionObserver` (like the test runner) rely on it.
3. Never have two page requests in flight at once. Fast scrolling or double-clicking must not duplicate posts.
4. Abort the in-flight request on unmount.
5. On error, show the message in an alert and a **Retry** button that retries the same page.
6. When `nextCursor` is `null`, stop loading and show `You're all caught up`.
7. Accessibility, following the WAI-ARIA **feed** pattern:
   - The list container has `role="feed"` and `aria-busy="true"` while a page is loading.
   - Each post is an `<article>` labelled by its title, with `aria-posinset` and `aria-setsize` (`-1` while the total is unknown) and `tabindex="0"`.
   - <kbd>Page Down</kbd>/<kbd>Page Up</kbd> move focus to the next or previous article.
   - Announce `Loaded 10 more posts` politely.

## Follow-up

- After a few thousand posts, scrolling gets janky. What would you do?
- Restore the scroll position when the user navigates to a post and comes back.
- New posts arrive while the user is reading. How do you show them without moving the content?
