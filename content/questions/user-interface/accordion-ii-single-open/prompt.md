Build an accordion where **at most one section is open at a time**, as in an FAQ page. The starter renders the sections with every panel visible and no interactivity.

## Requirements

1. Opening a section **closes whichever section was open**.
2. A `collapsible` prop (default `true`) controls whether clicking the open section closes it. With `collapsible={false}`, one section always stays open. Its header then gets `aria-disabled="true"`, because activating it does nothing.
3. Support **uncontrolled** use (`defaultValue`) and **controlled** use (`value` + `onValueChange`). With `value` set, the accordion never changes on its own. It calls `onValueChange(next)` and renders whatever `value` the parent passes back.
4. Accessibility as in the WAI-ARIA Accordion pattern: header `<button>`s inside headings with `aria-expanded` and `aria-controls`, panels with `role="region"` and `aria-labelledby`, and collapsed panels `hidden`.
5. <kbd>↑</kbd>/<kbd>↓</kbd>/<kbd>Home</kbd>/<kbd>End</kbd> move focus between headers.
6. The demo `App` shows a controlled accordion plus a line of text: "Open section: …" (or "none").

## Follow-up

- How does the native `<details name="faq">` exclusive accordion compare?
- How do you warn when a component switches between controlled and uncontrolled?
- How would you animate one panel closing while another opens?
