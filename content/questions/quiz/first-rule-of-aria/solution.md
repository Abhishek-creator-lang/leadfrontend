## TL;DR

The first rule of ARIA use: **if a native HTML element or attribute already has the semantics and behaviour you need, use it instead of adding ARIA**. ARIA only changes what assistive technology is **told** (role, name, state). It adds **no behaviour**: no focusability, no keyboard handling, no state changes. A `role="button"` on a `<div>` promises screen-reader users a button and then breaks the promise unless you also add `tabindex`, Enter and Space handling, and disabled states. The often-quoted WebAIM Million survey finds that pages using ARIA have, on average, *more* detected accessibility errors than pages without it. **No ARIA is better than bad ARIA.**

## The rules in brief

1. Use native HTML when possible.
2. Don't change native semantics unless you really have to (`<h2 role="tab">` is wrong; wrap it instead).
3. All interactive ARIA controls must be keyboard operable.
4. Don't use `role="presentation"` or `aria-hidden="true"` on focusable elements.
5. All interactive elements must have an accessible name.

## Common mistakes in code review

| Mistake | Why it's wrong | Fix |
|---|---|---|
| `<div role="button" onClick>` | Not focusable, no Enter/Space | `<button type="button">` |
| `<a onClick>` without `href` | Not focusable, wrong semantics | `<button>`, or a real link with `href` |
| `aria-label` on a `<div>` or `<span>` with no role | Names are ignored on generic elements by many screen readers | Give it a proper role, or use visible text |
| `aria-label` that contradicts visible text | Voice-control users say what they see ("click Submit") and it doesn't match (WCAG 2.5.3 Label in Name) | Start the label with the visible text, or use `aria-labelledby` |
| `aria-hidden="true"` on a container with focusable children | Keyboard users land on "nothing" | `inert`, or remove from the tab order |
| `role="menu"` for site navigation | Menu roles imply app-style arrow-key behaviour, and screen readers switch modes | `<nav>` with a list of links; a disclosure button for dropdowns |
| Static `aria-expanded="false"` that's never updated | State lies to users | Bind it to state; better, use a pattern from the APG |
| `aria-live` added to a region at the same time as the content | Nothing is announced | The live region must exist before content changes |
| Redundant roles: `<button role="button">`, `<ul role="list">` | Noise. (One exception: `role="list"` is sometimes added back because Safari removes list semantics when `list-style: none` is set) | Remove, unless deliberately working around that case |
| Positive `tabindex` (`tabindex="3"`) | Breaks natural focus order | `0` or `-1` only |
| Placeholder as the only label | Disappears on input, low contrast | `<label>` |

## When ARIA *is* the right tool

- **Composite widgets** with no native equivalent: tabs, tree views, comboboxes, grids. Follow the **ARIA Authoring Practices Guide (APG)** patterns for roles, states and keyboard interaction, and test with real screen readers.
- **Relationships and states** native HTML can't express: `aria-expanded`, `aria-controls`, `aria-current="page"`, `aria-describedby` for error messages, `aria-invalid`.
- **Live regions** for dynamic announcements.

Even then, check whether newer native features cover the case: `<dialog>`, `popover`, `<details>`, `<search>`, and `<select>` customisation in recent Chromium versions.

## How to enforce it on a team

- Lint (`eslint-plugin-jsx-a11y`) and automated checks (axe in unit, Storybook and end-to-end tests). These catch roughly a third of issues.
- Accessible primitives in the design system (headless libraries such as React Aria or Radix) so product teams don't hand-roll widgets.
- Manual keyboard and screen-reader testing (NVDA + Firefox or Chrome, VoiceOver + Safari) for new components.

## In an interview, mention…

- "ARIA changes semantics, not behaviour", and the button example.
- Three or four concrete mistakes you've caught in reviews, and the fix.
- APG patterns for complex widgets, and the tooling plus manual-testing process.
