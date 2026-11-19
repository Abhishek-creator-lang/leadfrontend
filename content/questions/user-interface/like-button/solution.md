## State design

| State | Why it's state |
|---|---|
| `liked` | Server-confirmed toggle value |
| `count` | Server-confirmed like count |
| `pending` | Drives disabled, `aria-busy` and the spinner |
| `error` | Message from the last failed attempt, or `null` |

Everything visual is derived: the label ("Like"/"Liked"), the icon and the colours via `[aria-pressed='true']`. Styling off the ARIA attribute keeps the visuals and the accessibility tree in sync. If one is wrong, both are wrong, and tests catch it.

The `action` is computed **once at click time** (`liked ? 'unlike' : 'like'`) and reused when the response arrives. The success handler sets `liked` from that action instead of toggling `!liked`, so a stale closure can't flip it the wrong way.

## Async flow

1. Bail out if already pending. The disabled button usually prevents a second click, but the guard also protects programmatic calls.
2. `setPending(true)` and clear the previous error.
3. `await likeApi(...)`. On success update `liked` and `count` (with an updater). On failure store `err.message`.
4. `finally` clears `pending`.

**Unmount safety:** the fake API can't be aborted, so a `mounted` ref skips state updates after unmount. With `fetch`, pass an `AbortController` signal and abort in the effect cleanup instead. That's better because it cancels the network work too.

## Accessibility

- `aria-pressed` turns a plain button into a **toggle button**. Screen readers announce "Like, toggle button, not pressed". Keep the accessible name stable-ish. Changing "Like" to "Liked" *and* toggling `aria-pressed` is acceptable, but some teams keep the label constant and rely on `aria-pressed` alone, because a changing name plus a pressed state can be read as a double negative.
- `aria-busy="true"` during the request tells AT the control is updating. `disabled` prevents double submits.
- The heart and spinner are `aria-hidden`: they're decoration, and the text carries the meaning.
- Errors use `role="alert"` so they're announced immediately. The message is rendered on failure, not pre-mounted and filled in, which is the reliable way to trigger alert announcements.
- Colour isn't the only signal: the label text also changes.

## Optimistic version

Flip `liked` and `count` immediately, fire the request, and roll back on error. It feels instant, which is why social apps do it. Trade-offs:

- Rolling back needs the **previous** value, so snapshot it before the update.
- Rapid toggles produce several in-flight requests. Either serialise them (queue), keep only the latest intent and send it debounced, or tag each request with an incrementing id and ignore stale responses.
- React 19's `useOptimistic` plus actions models exactly this. Mention it, but the manual version shows you understand the mechanics.

## Scaling it

- In a real feed, likes live in a server cache (TanStack Query / RTK Query / Relay) keyed by post id. The mutation updates the cache optimistically, so every place that shows the post updates together.
- Server truth wins: reconcile `count` with the response, since other users like the post concurrently.
- Rate-limit and debounce on the server too. Client guards are UX, not security.

## Follow-ups

- **Why not `aria-checked`?** That belongs to checkboxes and switches. A like is a button whose pressed state toggles.
- **Error UX:** an inline message near the control beats a global toast here, because the user's attention is already on the button.
- **Testing async UI:** use `findByRole` / `waitFor` and assert on `aria-pressed` and `aria-busy`, not on timers.
