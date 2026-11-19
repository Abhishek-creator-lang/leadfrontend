## TL;DR

Semantic elements carry **built-in meaning (an implicit ARIA role), behaviour and keyboard support** that browsers, assistive technology, search engines and reader modes rely on. A `<button>` is focusable, activates with Enter and Space, and is announced as "button". A `<div onclick>` is none of those until you rebuild it by hand. **Landmarks** (`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`, labelled `<section>` and `<form>`) map to ARIA landmark roles, so screen-reader users can **jump straight to regions**, the way sighted users scan a layout. Together with a sensible **heading outline**, landmarks are how non-visual users navigate a page.

## Landmark mapping

| Element | Implicit role | Notes |
|---|---|---|
| `<main>` | `main` | Exactly one visible per page |
| `<nav>` | `navigation` | Label each one if there are several: `<nav aria-label="Breadcrumb">` |
| `<header>` | `banner` | Only when it's **not** inside `article`, `aside`, `main`, `nav` or `section` |
| `<footer>` | `contentinfo` | Same scoping rule as `header` |
| `<aside>` | `complementary` | Related but secondary content |
| `<section>` | `region` | **Only if it has an accessible name** (`aria-labelledby`) |
| `<form>` | `form` | Only if it has an accessible name |
| `<search>` | `search` | New element, supported in current browsers; `role="search"` on a form is the fallback |

```html
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header>
    <nav aria-label="Primary">…</nav>
  </header>
  <main id="main">
    <h1>Order history</h1>
    <section aria-labelledby="recent-h">
      <h2 id="recent-h">Recent orders</h2>
      …
    </section>
  </main>
  <aside aria-label="Help">…</aside>
  <footer>…</footer>
</body>
```

Screen readers offer a landmarks list (NVDA's `D` key, VoiceOver's rotor) and a headings list (`H`, or `1`–`6` for levels). Many users navigate primarily by headings, so **one `<h1>` and no skipped levels** is the practical rule, even though the HTML "outline algorithm" based on sectioning elements was never implemented by browsers and has been removed from the spec.

## Beyond landmarks: semantics that save work

- **`<button>` vs `<a>`**: links navigate (they have a URL, can be opened in a new tab, are announced as "link"). Buttons perform actions. Using the wrong one breaks expectations for keyboard and screen-reader users.
- **Native form controls** with `<label for>`, `<fieldset>`/`<legend>` for groups.
- **Lists** (`<ul>`/`<ol>`) announce item counts. **Tables** with `<th scope>` let screen readers announce headers per cell.
- **`<time datetime>`, `<abbr>`, `<figure>`/`<figcaption>`, `<details>`/`<summary>`** (a native disclosure widget with free keyboard support).
- **`<dialog>`** for modals, with focus handling built in.

## Why it matters beyond accessibility

- **SEO and reader modes** understand main content, navigation and articles.
- **Less JavaScript and fewer bugs**: native elements handle focus, keyboard and states.
- **Legal and compliance**: WCAG 1.3.1 (Info and Relationships) and 4.1.2 (Name, Role, Value) are commonly audited. Accessibility regulations such as the European Accessibility Act (applying from June 2025) make this a business requirement.

## Pitfalls

- Over-landmarking: wrapping everything in `<section>` or adding `role="region"` everywhere makes the landmark list noisy.
- Repeating the role: `<nav role="navigation">` is redundant (harmless, but signals cargo-culting).
- CSS that changes visual order away from DOM order.
- Component libraries that render `<div role="button">` without keyboard handling.

## In an interview, mention…

- Implicit roles and free behaviour, with button vs div as the classic example.
- Landmarks and headings as the primary navigation mechanisms for screen-reader users, and labelling repeated landmarks.
- How you'd audit: the browser's accessibility tree view, axe, and a manual screen-reader pass.
