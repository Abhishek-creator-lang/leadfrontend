Design a reusable **autocomplete (typeahead) component**, like the search box on Google, Amazon or the people
picker in a social app.

As the user types, a list of suggestions appears below the input. The user can pick one with the mouse or keyboard.

The interviewer wants the component to be:

- **Generic**: used by many product teams for different data sources (product search, user mentions, city picker)
  with custom rendering of each suggestion.
- **Fast**: suggestions should appear within ~100–200 ms of typing on a good connection, without hammering the
  backend.
- **Correct**: never show results for a stale query.
- **Accessible**: fully usable with keyboard and screen readers.

Discuss the component's API, internal state, how it talks to the server, caching, and the performance,
accessibility and edge-case handling you would build in.
