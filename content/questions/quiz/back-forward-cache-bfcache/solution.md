## TL;DR

The **bfcache** keeps a **complete in-memory snapshot of a page**, including its JS heap and DOM, when the user navigates away. Pressing Back or Forward then restores it **instantly**, with no network, no parsing and no re-running scripts. Back and forward navigations are a large share of all navigations (Chrome has reported roughly 1 in 10 on desktop and 1 in 5 on mobile), so bfcache eligibility is one of the cheapest big wins for real-user LCP. Pages become **ineligible** because of things like **`unload` handlers**, open connections (WebSocket, WebRTC, in-progress IndexedDB transactions), `window.opener` references and, historically in Chromium, `Cache-Control: no-store`.

## Lifecycle events

```js
window.addEventListener('pagehide', (e) => {
  // e.persisted === true → page may be going into bfcache
  flushAnalytics();
});

window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    // Restored from bfcache: JS state is intact, but the world may have changed
    refreshStaleData();        // cart count, notifications, auth state
    reconnectWebSocket();
    reportVisit({ type: 'back_forward_cache' });
  }
});
```

Use **`pagehide`** and **`visibilitychange`**, never **`unload`**, for cleanup and beaconing. Firefox historically disqualified pages with `unload` listeners from bfcache, and Chromium is phasing `unload` out entirely. A `Permissions-Policy: unload=()` header lets you block unload handlers, including ones added by third-party scripts.

## Common blockers

| Blocker | Fix |
|---|---|
| `unload` listeners (yours or third-party) | Switch to `pagehide`; use `Permissions-Policy: unload=()` |
| Open WebSocket / WebRTC / BroadcastChannel | Close on `pagehide`, reopen on `pageshow` |
| Unfinished IndexedDB transactions, held Web Locks | Finish or release before leaving |
| `window.opener` relationships | `rel="noopener"` (the default for `target=_blank` now) |
| `Cache-Control: no-store` on the HTML | Chromium has historically blocked these and has been experimenting with relaxing it; avoid `no-store` unless the page is truly sensitive |
| `beforeunload` registered permanently | Add it only while there are unsaved changes |
| Pages opened by or controlling other windows, in-progress fetches with `keepalive` | Case by case |

## Testing and monitoring

- **DevTools → Application → Back/forward cache**: "Test back/forward cache" runs a navigation and lists the blocking reasons (actionable vs browser-specific).
- **`notRestoredReasons`** on the navigation timing entry (Chromium) reports in the field why a back navigation wasn't restored, including reasons caused by iframes.

```js
const nav = performance.getEntriesByType('navigation')[0];
if (nav.type === 'back_forward' && nav.notRestoredReasons) {
  report(nav.notRestoredReasons);
}
```

- Track **bfcache hit rate** in RUM as `pageshow` with `persisted` divided by all back/forward navigations.

## Things that break *after* restore

- **Stale data**: a restored page may show an old cart, expired auth or prices. Refresh on `pageshow` with `persisted`, or show a light "updated" state.
- **Analytics**: restores don't run your page-load code, so page views go uncounted unless you handle `pageshow`.
- **Timers** resume. Intervals that assumed continuous running may fire with large time gaps.
- **Sensitive pages** after logout: users could press Back and see private data. For those pages, deliberately opt out (`no-store`) or clear the screen on `pagehide`.
- **SPAs**: back navigation within an SPA is handled by your router, not the bfcache. bfcache matters when leaving the SPA and returning.

## In an interview, mention…

- What's cached (the whole live page) and why it's a big real-user win.
- `pagehide`/`pageshow` with `persisted`, and why `unload` is harmful.
- The main blockers and the DevTools test plus `notRestoredReasons` for field data.
- Handling stale state and analytics after restore, and security for logged-out pages.
