## Markup first

```html
<article aria-labelledby="name">
  <img alt="">
  <div>
    <header> name · @handle · <time datetime title> </header>
    <p> text </p>
    <footer> buttons </footer>
  </div>
</article>
```

- **`<article>`** is the right element for a self-contained item in a feed. Labelling it by the author's name lets screen-reader users browse a feed article by article ("Priya Raman, article"). The ARIA `feed` pattern builds on exactly this.
- **Avatar `alt=""`:** the author's name is right next to it, so describing the photo ("Photo of Priya") is redundant noise. Decorative images get empty alt, never a missing alt (which makes some screen readers read the URL).
- **`<time dateTime>`** gives a machine-readable timestamp, and `title` shows the absolute time on hover. `title` isn't keyboard- or touch-accessible, so in production the timestamp is usually a link to the post with the full time in its accessible name.
- **`<header>` and `<footer>`** inside an article don't create page landmarks; they just group content semantically.

## Accessible action buttons

```jsx
<button aria-label="Like, 15,342 likes" aria-pressed={liked}>
  <svg aria-hidden="true" focusable="false" />
  <span aria-hidden="true">15.3K</span>
</button>
```

- Icon-only controls need a name. The visible compact number is hidden, and the label contains the **exact, formatted** count, because "15.3K" reads poorly ("fifteen point three K").
- Like is a toggle button (`aria-pressed`) with a constant name. Reply, Repost and Share are plain actions.
- `focusable="false"` on the SVG stops old IE/Edge from adding SVGs to the tab order. It's harmless elsewhere.
- Targets are at least 36 px tall with padding. Expand the hit area further on touch devices.
- The liked state is shown by fill **and** colour, so it doesn't rely on colour alone.

## Like state

The card keeps local `liked` state and derives the count: `base − (initially liked) + (liked now)`. Deriving rather than storing the count means it can't drift out of sync with `liked`. In a real app, this is an optimistic mutation against a server cache keyed by post id (see *Like Button*).

## CSS details

- **Grid** for avatar and body: `48px minmax(0, 1fr)`. The `minmax(0, …)` lets the body shrink, so text truncation works.
- **Truncation:** the header is `nowrap`. Name and handle have `overflow: hidden; text-overflow: ellipsis; min-width: 0`. The handle shrinks first (`flex-shrink: 2`), and the time never shrinks. That's the order users care about.
- **Text:** `white-space: pre-line` keeps user line breaks but collapses runs of spaces. `overflow-wrap: anywhere` stops long URLs blowing out the card.
- `width`/`height` on the avatar reserves space before the image loads (no layout shift), and `loading="lazy"` defers off-screen images.

## Formatting

- `Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })` gives 1.2K and 15.3M, localised for other locales ("1,2 k" in French, "1.5万" in Japanese).
- Relative time: the compact "47m", "3h", "2d" style, falling back to a short date after a week. For verbose phrasing ("3 hours ago") in any locale, use `Intl.RelativeTimeFormat`.

## Keeping times fresh

Don't give every card its own `setInterval`. Use one shared ticker, a context or store that updates once a minute (or a `useNow(60_000)` hook backed by a single timer), and let cards subscribe. Only cards with times under an hour actually change, so memoised cards whose output is identical won't re-render the DOM.

## Security

Render text as **text** (React escapes it), never with `dangerouslySetInnerHTML`. Linkifying mentions, hashtags and URLs should tokenise the string into React elements, and URLs must be validated (allow only `http`/`https`, which blocks `javascript:` links) and opened with `rel="noopener noreferrer"`. For moderation, the server stores the raw text and the client never trusts embedded markup.

## Scaling to a feed

- **Virtualisation** (render only the visible cards) once feeds get long, with measured, variable row heights.
- `React.memo` cards keyed by id, with stable callbacks.
- The ARIA `feed` role with `aria-busy` while loading more, `aria-setsize`/`aria-posinset` on articles, and Page Up/Down to move between articles.
- Images through a CDN with `srcset`, and skeleton placeholders sized like the real card.
