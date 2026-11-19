## TL;DR

**`window` is the global object for the browsing context**: it represents the tab/frame and holds globals, timers, `location`, `history`, `localStorage`, viewport size and so on. **`document` is the loaded page**: the root of the DOM tree (`Document` node) with APIs to query and create elements. `document` is a property of `window` (`window.document`), and each frame has its own pair.

## Side by side

| | `window` | `document` |
|---|---|---|
| Represents | The browser tab, iframe or popup (a browsing context) | The HTML document loaded in it |
| Interface | `Window` (also the global object, `globalThis`) | `Document` (a `Node`) |
| Typical APIs | `setTimeout`, `fetch`, `location`, `history`, `navigator`, `localStorage`, `innerWidth`, `scrollTo`, `matchMedia`, `requestAnimationFrame`, `postMessage` | `querySelector`, `createElement`, `body`, `head`, `title`, `cookie`, `readyState`, `activeElement`, `forms`, `visibilityState` |
| Events | `load`, `resize`, `scroll` (viewport), `popstate`, `hashchange`, `message`, `storage`, `beforeunload`, `pagehide` | `DOMContentLoaded`, `readystatechange`, `visibilitychange`, plus bubbled DOM events |
| Lifetime | A new `Window` per navigation (the tab's `WindowProxy` stays the same) | Replaced on every navigation |

## Code

```js
window === globalThis;          // true in the main thread
var answer = 42;                // classic script, top-level var
window.answer;                  // 42 (becomes a window property)
let hidden = 1;
window.hidden;                  // undefined (let/const don't)

document.title = 'Inbox (3)';
const btn = document.createElement('button');
document.body.append(btn);

window.addEventListener('resize', () => console.log(innerWidth));
document.addEventListener('DOMContentLoaded', init);
```

Because `window` is the global object, you can usually omit it: `setTimeout(...)` is `window.setTimeout(...)`. In ES modules, top-level `var` does **not** create a `window` property, since modules have their own scope.

## Things that trip people up

- **`window.location` vs `document.location`**: both point to the same `Location` object. `document.URL` is a read-only string.
- **Named access**: elements with an `id` become properties of `window` (`window.myId`). It's legacy behaviour, so don't rely on it, and it can clash with globals (a DOM-clobbering attack vector).
- **Scroll**: the viewport scroll lives on `window` (`scrollY`, `scrollTo`), but the scrolling element is `document.scrollingElement` (usually `<html>`).
- **Workers have no `window` or `document`.** Their global is `self` (`WorkerGlobalScope`). Use `globalThis` in shared code.
- **iframes**: `iframe.contentWindow` is the child's `window`; `iframe.contentDocument` is accessible only if same-origin. Cross-origin, you get a restricted `WindowProxy` you can only `postMessage` to.
- **SSR**: neither exists in Node, so guard browser-only code (`typeof window !== 'undefined'`) or run it in effects.

## In an interview, mention…

- `window` = environment/global scope + browser APIs; `document` = DOM tree of the page.
- `document` hangs off `window`, and there's one pair per frame.
- Workers and server rendering lack both, so `globalThis` is the portable global.
- Which events belong where (`load`/`resize` on window, `DOMContentLoaded`/`visibilitychange` on document).
