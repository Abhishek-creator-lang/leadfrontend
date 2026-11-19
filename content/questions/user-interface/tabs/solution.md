## Component API and state

```jsx
<Tabs items={[{ value, label, panel }]} defaultValue="pricing" label="Product information" />
```

The only state is the **selected value**. Store the item's `value`, not its index. Indices break when items are inserted, removed or reordered, and values make a natural key for URL syncing later.

`useState(defaultValue ?? items[0]?.value)` handles the default and an empty list without crashing. A `defaultValue` is an *initial* value only, which follows the React convention (like `<input defaultValue>`). Changing the prop later doesn't reset the state.

## Accessibility (WAI-ARIA Tabs pattern)

| Element | Role / attributes |
|---|---|
| Button row | `role="tablist"` + `aria-label` (or `aria-labelledby` pointing to a visible heading) |
| Each button | `role="tab"`, `aria-selected`, `aria-controls` → panel id |
| Each panel | `role="tabpanel"`, `aria-labelledby` → tab id, `tabIndex={0}` |

- Hidden panels use the `hidden` attribute, so they leave the accessibility tree and the tab order.
- `tabIndex={0}` on the panel lets keyboard users Tab from the tab list into the content when the panel holds no focusable elements. APG recommends this. Drop it if the panel's first child is already focusable.
- IDs come from `useId`, so two instances never collide (tested) and SSR output matches the client.
- The selected style uses a border **and** colour and weight, so it doesn't rely on colour alone (WCAG 1.4.1).
- The CSS targets `[aria-selected='true']` rather than an extra `active` class. One source of truth.

This version deliberately leaves out arrow-key navigation and roving `tabIndex`, which *Tabs II* adds. In an interview, say that out loud: a `tablist` without arrow keys is only a partial implementation of the pattern.

## Mount or unmount hidden panels?

| Approach | Pros | Cons |
|---|---|---|
| Keep mounted, toggle `hidden` (this solution) | Preserves form input, scroll and media state. Instant switching. | All panels render up front. Effects in hidden panels keep running. |
| Render only the active panel | Cheap initial render. Lazy-load per tab. | State is lost on switch unless lifted. Remounting can be slow. |
| Lazy mount, then keep mounted | Best of both for heavy tabs | A little more bookkeeping (a `Set` of visited tabs) |

## Scaling to a design system

- **Composition API:** `<Tabs><Tabs.List><Tabs.Tab value="a"/></Tabs.List><Tabs.Panel value="a"/></Tabs>`, with context sharing `selected`, `setSelected` and `baseId`. Arbitrary JSX can then go in tabs and panels.
- **Controlled and uncontrolled:** accept `value` + `onValueChange`. When `value !== undefined`, use it and call the callback instead of setting state.
- **URL sync:** keep the selected tab in a search param (`?tab=pricing`) so deep links and the back button work.
- **Overflow:** many tabs need horizontal scrolling with `scrollIntoView({ inline: 'nearest' })` on selection, or an overflow menu.

## Follow-ups

- **Why `role="tab"` instead of links?** If each tab changes the URL and loads a page, it's navigation. Use `<nav>` with links and `aria-current="page"`, not tabs.
- **Vertical tabs:** add `aria-orientation="vertical"` and use Up/Down arrows.
- **Testing:** assert on `aria-selected` and the single visible `tabpanel`, as the tests do.
