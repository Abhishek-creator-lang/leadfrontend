Build a **Like** button for a post. The starter includes a fake `likeApi(action, { fail })` that resolves after about 300 ms, and rejects when `fail` is `true`.

## Requirements

1. The post starts **not liked**, with **42** likes. The button shows a heart icon, the text "Like" and the count.
2. Clicking the button calls `likeApi('like')` (or `'unlike'` when already liked).
3. **While the request is pending:**
   - the button is disabled and has `aria-busy="true"`
   - it shows a spinner instead of the heart.
4. **On success:** toggle the liked state and update the count. A liked button reads "Liked" and uses a filled, coloured heart.
5. **On failure:** keep the previous state and show the error message below the button with `role="alert"`. Clear the error on the next attempt.
6. A **"Simulate network error"** checkbox (already in the starter) decides whether the next request fails.
7. Accessibility: it's a toggle button, so expose its state with `aria-pressed`. The heart and spinner are decorative.

## Follow-up

- Make it **optimistic**: flip the state immediately and roll back on failure. What are the trade-offs?
- The user clicks five times quickly. How do you avoid races between responses?
- What if the component unmounts while the request is in flight?
