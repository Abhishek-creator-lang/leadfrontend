Build the "holy grail" page layout. The starter renders the five regions as plain `<div>`s, stacked with no styling.

```
┌──────────────── header ────────────────┐
│ nav (200px) │   main (fluid)   │ aside │
│             │                  │(200px)│
└──────────────── footer ────────────────┘
```

## Requirements

1. **Header** and **footer** span the full width. The **nav** and **aside** columns are 200 px wide, and **main** takes the remaining space.
2. All three columns are as tall as the tallest one.
3. With little content, the footer still sits at the **bottom of the viewport** (a "sticky footer"). With a lot of content, it's pushed down normally.
4. **Responsive:** below 720 px, stack everything in one column in the order header, nav, main, aside, footer.
5. Use semantic landmarks (`header`, `nav`, `main`, `aside`, `footer`) and give the nav an accessible name.
6. Add a **"Skip to main content"** link that becomes visible when focused.
7. Long words or URLs in the main column must not break the layout.

There are no tests. This is about CSS and semantics, so be ready to explain each declaration.

## Follow-up

- How would you have done this before CSS Grid (floats, flexbox)? What were the pain points?
- Why `100dvh` rather than `100vh` on mobile?
- Should main come before nav in the source order? What are the accessibility implications?
