## TL;DR

You can't run JavaScript to detect that JavaScript is off, so detection is done **declaratively**: use the **`<noscript>`** element for fallback content, or the **"no-js" class pattern**, where the server sends `<html class="no-js">` and the first inline script swaps it to `js`. CSS can then style both states. The CSS media feature `@media (scripting: none)` is a newer option. To *know* on the server, make the JS-enabled path send a signal (cookie, beacon) and treat its absence as "no JS".

## 1. `<noscript>`

```html
<noscript>
  <p class="banner">This app needs JavaScript. Here is a <a href="/basic">basic version</a>.</p>
</noscript>
```

- Rendered only when scripting is disabled. In `<head>` it may only contain `<link>`, `<style>` and `<meta>`, which is handy for a no-JS stylesheet.
- It **doesn't** help when JS is enabled but your bundle failed to load (network error, CSP block, syntax error in an old browser, blocked by an extension). That case is far more common than JS being turned off.

## 2. The no-js / js class swap

```html
<html class="no-js">
<head>
  <script>
    document.documentElement.classList.replace('no-js', 'js');
  </script>
```

```css
.no-js .carousel-controls { display: none; }
.js .static-gallery { display: none; }
```

The inline script runs before first paint, so there's no flash. You can extend the idea: only add a `js-ready` class after your app bundle has actually booted, and show fallbacks until then. That also covers failed bundle loads.

## 3. CSS `scripting` media feature

```css
@media (scripting: none) {
  .requires-js { display: none; }
}
@media (scripting: enabled) {
  .no-js-hint { display: none; }
}
```

Supported in current Chromium, Firefox and Safari. Values are `none`, `initial-only` (printing, for example) and `enabled`.

## 4. Telling the server

The server can't see JS settings in the request. Common approaches:

- Set a cookie from JS (`document.cookie = 'js=1'`) and check it on subsequent requests.
- Fire a beacon from JS and compare with page views in analytics.
- `<noscript><img src="/pixel?nojs=1" alt=""></noscript>` to count no-JS views.

## The better framing: progressive enhancement

Rather than detecting and apologising, design so the core works without client JS:

- Real `<a href>` links and `<form action method>` submissions that the server handles.
- Server-rendered HTML (SSR/SSG) with JS layered on top, which is what modern frameworks' form actions and server rendering encourage.
- Then the "JS disabled" case, the "bundle failed" case and the "still loading on slow 3G" case all degrade the same way.

## In an interview, mention…

- `<noscript>` and the no-js class swap, plus `@media (scripting)`.
- That JS *failing* is much more common than JS being *disabled*, so test that path (block the bundle in DevTools).
- Progressive enhancement and SSR as the real answer for resilience, SEO and slow networks.
