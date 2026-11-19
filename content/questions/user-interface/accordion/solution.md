## State design

The only state is **which sections are open**. A `Set` of section values fits naturally because several sections can be open at once. Store values rather than indices, so open state survives reordering or inserting sections.

```js
const [open, setOpen] = useState(() => new Set());
```

Updates must create a **new** `Set`. Mutating the existing one keeps the same reference, so React bails out and doesn't re-render.

## Accessibility (WAI-ARIA Accordion pattern)

| Element | Attributes | Why |
|---|---|---|
| Header | `<button type="button">` inside a heading | Native focus plus Enter/Space activation. The heading level gives document structure. |
| Header | `aria-expanded`, `aria-controls` | Announces "collapsed"/"expanded" and links to the panel |
| Panel | `role="region"`, `aria-labelledby` | Makes the panel a landmark, named by its header |
| Panel | `hidden` when collapsed | Removes it from the accessibility tree *and* the tab order. `display:none` via CSS also works, but `opacity:0` does not. |

IDs come from **`useId`**, so two accordions on the same page never collide. `useId` also produces matching IDs between server and client rendering, which `Math.random()` doesn't.

## Keyboard navigation

Enter and Space work for free because the headers are real `<button>`s. Arrow, Home and End navigation uses an array of refs and a `keydown` handler. Call `preventDefault()` so <kbd>↓</kbd> doesn't also scroll the page. Wrap around at both ends.

## Things that show seniority

- **Controlled and uncontrolled API.** Accept `value`/`defaultValue`/`onValueChange`, as Radix and MUI do, so the parent can own state when it needs to (for example to sync open sections to the URL).
- **Composition over configuration.** For a design system, expose `<Accordion><Accordion.Item><Accordion.Trigger/><Accordion.Content/></Accordion.Item></Accordion>`, sharing state through context. A `sections` array prop becomes limiting when panels need rich content.
- **Animation.** Animating `height: auto` needs measurement. Options are the CSS `grid-template-rows: 0fr → 1fr` trick, `interpolate-size: allow-keywords` where it's supported, or measuring `scrollHeight` in `useLayoutEffect`. Respect `prefers-reduced-motion`.
- **Lazy panel content.** Render panel children only after the first open if they're expensive.
- **`<details>`/`<summary>`.** Mention that native disclosure elements give expand and collapse for free, and that `name` on `<details>` gives an exclusive accordion in modern browsers. Explain why a design system might still build a custom component: styling control and consistent arrow-key behaviour.

## Follow-ups

- **Single-open mode:** keep a single `value` instead of a `Set`, or replace the set on open.
- **Testing:** use Testing Library's `getByRole('button', { name })` and assert on `aria-expanded` rather than on class names, which tests behaviour the same way users experience it.
