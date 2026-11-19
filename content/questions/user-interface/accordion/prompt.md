Build an `Accordion` component that shows a list of sections. Each section has a header button that expands or collapses its panel.

The starter file has the section data and a static layout. Make it interactive and accessible.

## Requirements

1. All sections start **collapsed**.
2. Clicking a header toggles its section. **Several sections can be open at once.**
3. Each header shows an indicator (for example a chevron) that reflects whether it's open.
4. Accessibility, following the WAI-ARIA Accordion pattern:
   - Each header is a real `<button>` with `aria-expanded` and `aria-controls` pointing to its panel.
   - Each panel has `role="region"` and `aria-labelledby` pointing back to its header.
   - Collapsed panels are hidden from everyone, including screen readers (`hidden`).
   - IDs are unique even if the page renders two accordions (use `useId`).
5. Keyboard support: <kbd>Enter</kbd>/<kbd>Space</kbd> toggle (native buttons do this). <kbd>↓</kbd>/<kbd>↑</kbd> move focus to the next/previous header and wrap around. <kbd>Home</kbd>/<kbd>End</kbd> jump to the first/last header.

## Follow-up

- Add a `multiple={false}` mode where opening one section closes the others.
- Make it controlled (`value` / `onChange`) as well as uncontrolled.
- How would you animate the height without layout thrash?
