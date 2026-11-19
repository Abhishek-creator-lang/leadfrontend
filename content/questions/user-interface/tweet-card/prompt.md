Build a card that displays a short social media post. The starter has a sample `post` object and an unstyled, `<div>`-only rendering.

## Requirements

1. **Layout:** avatar on the left. On the right: display name (bold), @handle and relative time on one line, then the post text, then a row of actions. Long names and handles truncate with an ellipsis instead of wrapping the header.
2. **Actions:** Reply, Repost, Like and Share, each with an icon and a count. Counts use compact notation (`1.2K`, `3.4M`). Share has no count.
3. **Like** is a toggle: clicking it fills the heart, colours it, and adjusts the count by 1.
4. **Time:** show a relative time ("5m", "3h", "2d", or a date like "Nov 3" for older posts). Put the full date and time in a `<time dateTime>` element with a tooltip (`title`).
5. **Semantics and accessibility:**
   - The card is an `<article>` labelled by the author's name.
   - The avatar is decorative because the name is right next to it.
   - Icon buttons have accessible names that include the count, for example "Like, 1,204 likes". Screen readers shouldn't read "1.2K".
   - Line breaks in the text are preserved, and URLs don't overflow the card.
6. The card is responsive: it fills its container up to 560 px.

There are no tests. It's a markup, CSS and semantics exercise, so be ready to justify your choices.

## Follow-up

- How would you render a feed of 10,000 of these?
- How do you keep relative times fresh without re-rendering every card every second?
- The post text can contain user-generated content. What are the security implications?
