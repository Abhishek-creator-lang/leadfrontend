## TL;DR

A **live region** is an element whose content changes are **announced by screen readers without moving focus**, for things like "3 results found", "Saved", "Item added to cart" or a form error summary. Use **`role="status"`** (implicitly `aria-live="polite"`: announced when the user is idle) for most updates, and **`role="alert"`** (implicitly `assertive`: interrupts) only for urgent, time-sensitive errors. The number-one rule: **the live region must already be in the DOM, and registered by the screen reader, before you change its content**. Inserting a region that already contains text is often not announced. WCAG 4.1.3 (Status Messages) requires this kind of announcement for status changes that don't receive focus.

## The attributes

| Attribute / role | Meaning |
|---|---|
| `aria-live="polite"` | Announce after current speech finishes |
| `aria-live="assertive"` | Interrupt current speech. Use rarely |
| `role="status"` | Polite + `aria-atomic="true"` implied |
| `role="alert"` | Assertive + atomic. For errors that need immediate attention |
| `role="log"` | Polite, new additions only (chat messages) |
| `aria-atomic="true"` | Read the whole region, not just the changed node |
| `aria-relevant` | Which changes count (`additions text` by default). Rarely needed, and support is inconsistent |
| `<output>` | Native element with an implicit `status` role, good for calculated results |

## A reliable announcer pattern

```html
<!-- Rendered once at app start, visually hidden but not display:none -->
<div id="announcer" role="status" class="visually-hidden"></div>
```

```js
let timer;
export function announce(message) {
  const el = document.getElementById('announcer');
  el.textContent = '';                       // clear so repeat messages re-announce
  clearTimeout(timer);
  timer = setTimeout(() => { el.textContent = message; }, 100);
}

// After filtering
announce(`${results.length} results for “${query}”`);
```

```css
.visually-hidden {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
}
```

Why the clear-then-set dance: identical consecutive text may not be re-announced, and setting content in the same tick as creating the region is often missed.

## Where to use what

- **Search and filter result counts**, "copied to clipboard", "saved", background sync status → polite status.
- **Form submission errors** → move **focus** to an error summary (better than a live region, because the user needs to act), with links to each field. Inline field errors are associated via `aria-describedby`.
- **Session timeout warnings**, payment failures → `role="alert"`.
- **Toasts**: put the toast container's live region in the DOM permanently. Don't auto-dismiss important toasts too quickly (WCAG 2.2.1 Timing Adjustable), and never put interactive controls *only* in a toast.
- **SPA route changes**: screen readers don't get a page-load announcement. Move focus to the new page's `<h1>` (with `tabindex="-1"`) or announce the new title. Many routers now do one of these by default.

## Pitfalls

- `display: none` or `hidden` on the region: hidden content isn't announced. Use the visually-hidden pattern.
- Over-announcing: live-updating a stock ticker or character counter on every keystroke floods the user. Debounce, or announce only at thresholds ("20 characters left").
- `assertive` everywhere, which keeps interrupting the user.
- Multiple competing live regions announcing at once.
- Not testing: behaviour differs between NVDA, JAWS, VoiceOver and TalkBack. Test the main flows in at least two.

## In an interview, mention…

- Polite vs assertive, `status`/`alert`/`log`, and `aria-atomic`.
- The "region must pre-exist" rule and a shared announcer utility.
- When focus management beats a live region (errors, route changes).
- WCAG 4.1.3 and testing across screen readers.
