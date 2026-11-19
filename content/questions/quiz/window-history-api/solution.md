## TL;DR

`window.history` lets you **move through the session history** (`back()`, `forward()`, `go(n)`) and **change the URL without reloading** (`pushState()` adds an entry, `replaceState()` overwrites the current one). When the user presses Back/Forward between entries you created, the browser fires **`popstate`** and your code must render the matching view. This is the foundation of client-side routing in SPAs. The newer **Navigation API** (`window.navigation`) is a more complete replacement (shipped first in Chromium, with other engines following).

## Core API

```js
history.length;        // entries in this tab's session history
history.back();        // like the Back button
history.forward();
history.go(-2);        // relative jump; go(0) reloads

history.pushState({ productId: 42 }, '', '/products/42');    // new entry
history.replaceState({ ...history.state, tab: 'reviews' }, '', '?tab=reviews'); // update current
history.state;         // state object of the current entry
history.scrollRestoration = 'manual'; // take control of scroll on traversal
```

- The second argument (`title`) is ignored by browsers; pass `''`.
- The URL must be **same-origin**, otherwise a `SecurityError` is thrown.
- `pushState` **doesn't** fire `popstate` and doesn't load anything. You update the UI yourself.
- State is structured-cloned and size-limited. Store small, serializable data (IDs), not whole API responses.

## A minimal router

```js
function render(path) {
  const view = routes[path] ?? routes['/404'];
  document.querySelector('main').replaceChildren(view());
}

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href]');
  if (!a || a.origin !== location.origin || a.target || e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  history.pushState({}, '', a.href);
  render(location.pathname);
});

window.addEventListener('popstate', () => render(location.pathname));
render(location.pathname);
```

Respecting modifier keys keeps "open in new tab" working, and using real `<a href>` keeps links crawlable and accessible.

## Things to get right in an SPA

- **Back/forward must restore state**: URL is the source of truth for the view, filters and pagination.
- **Push vs replace**: push for meaningful navigations; replace for things like typing in a search box, so Back doesn't step through every keystroke.
- **Scroll and focus**: after a route change, move focus to the new page's heading or main region and announce the change (a live region with the page title), since screen readers don't get a page load event. Restore scroll position on Back.
- **Document title**: update `document.title` per route.
- **Server fallback**: deep links like `/products/42` must return the app shell (or SSR content) from the server, not a 404.
- `hashchange` and `#/route` URLs are the legacy approach, still useful for static hosting without rewrites.

## Navigation API (modern)

```js
navigation.addEventListener('navigate', (event) => {
  if (!event.canIntercept || event.hashChange) return;
  event.intercept({ handler: () => render(new URL(event.destination.url).pathname) });
});
```

It centralises link clicks, form submissions and back/forward into one event, and supports `navigation.entries()` and abortable navigations. Check support before relying on it, and keep a History API fallback.

## In an interview, mention…

- `pushState`/`replaceState` don't fire `popstate`; traversal does.
- URL as state, plus focus management and title updates for accessibility.
- Server rewrite rules for deep links, and the Navigation API as the newer alternative.
