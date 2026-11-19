## State design

Only one section can be open, so the state is a single value: `string | null`. That's simpler than the `Set` used for a multi-open accordion, and it makes "only one open" true by construction. You can't write a bug that leaves two sections open.

```js
const toggle = (v) => (v === openValue ? collapsible && setOpenValue(null) : setOpenValue(v));
```

## Controlled vs uncontrolled

Design-system components should support both:

- **Uncontrolled** (`defaultValue`): the component owns the state. This is the easiest to use.
- **Controlled** (`value` + `onValueChange`): the parent owns it, for example to sync with the URL, open a section from elsewhere, or persist it.

The small `useControllableState` hook captures the rule:

```js
const isControlled = value !== undefined;
const current = isControlled ? value : internal;
const setValue = (next) => { if (!isControlled) setInternal(next); onChange?.(next); };
```

Points worth saying in an interview:

- `undefined` means "uncontrolled" and `null` means "controlled, nothing open". So the uncontrolled default is `null`, and `value={null}` is a valid controlled value.
- In controlled mode the component **never** updates itself. The test checks that clicking calls `onValueChange('c')` but keeps rendering `value="a"` until the parent re-renders.
- Switching between controlled and uncontrolled mid-life is a bug. Libraries capture `isControlled` in a ref on mount and `console.warn` if it changes, as React does for `<input>`.

## Accessibility

- Header buttons sit inside `<h3>` so screen-reader users can jump between questions with heading navigation.
- `aria-expanded` and `aria-controls` on the trigger, `role="region"` and `aria-labelledby` on the panel. Collapsed panels use `hidden`, so they're out of the accessibility tree and the tab order.
- With `collapsible={false}`, the open section's trigger gets `aria-disabled="true"`, as APG recommends when a panel can't be collapsed. It stays focusable (unlike `disabled`), so arrow navigation still lands on it.
- The chevron is `aria-hidden` and rotates through the `[aria-expanded='true']` selector, so it follows state without an extra class. Motion respects `prefers-reduced-motion`.
- Arrow keys, Home and End move focus between headers and `preventDefault()` stops page scroll.

## Edge cases

- `defaultValue` or `value` pointing at a missing item: nothing renders open, which is harmless.
- Items reordering: state is keyed by `value`, so the right section stays open.
- The ref array is indexed by position, which is fine because it's rewritten every render in DOM order.

## Native alternative

```html
<details name="faq"><summary>Question</summary>Answer</details>
```

Giving several `<details>` elements the same `name` makes them mutually exclusive in current browsers, with zero JavaScript, and find-in-page can open them. Trade-offs: limited styling of the marker, no arrow-key navigation between summaries, and the open state is harder to control from React. Mention it. It's often the right call for content pages.

## Animation

When one panel closes as another opens, animate both heights at once so the content below doesn't jump twice. Options: the CSS `grid-template-rows: 0fr ↔ 1fr` trick, `interpolate-size: allow-keywords` where it's supported, or measure with `useLayoutEffect`. To animate the closing panel, keep it rendered until `transitionend` before setting `hidden`.

## Follow-ups

- **Deep linking:** keep the open value in `location.hash` and scroll it into view on load.
- **Compound API:** `<Accordion type="single" collapsible>` with `Accordion.Item/Trigger/Content` through context, like Radix's `type="single" | "multiple"` switch.
