This builds on *Data Table*. The starter is a working paginated users table. Add **sorting** and **filtering**.

## Requirements

1. **Filtering.** Add a search input labelled **"Search users"**. It matches users whose **name or occupation** contains the text, ignoring case and surrounding whitespace. Show the number of matches, e.g. `12 results`.
2. **Sorting.** Every column header is a button.
   - Clicking a column sorts by it **ascending**; clicking the same column again toggles to **descending**.
   - Clicking a different column sorts by that column ascending.
   - Numbers sort numerically (`9` before `10`); text sorts alphabetically, ignoring case.
   - Show an arrow indicating the direction.
3. Filtering or changing the sort goes back to **page 1**. Pagination (`Page X of Y`, rows per page, previous/next) works on the filtered, sorted list.
4. When nothing matches, show a "No users match …" message inside the table.
5. Accessibility:
   - The sorted column's `<th>` has `aria-sort="ascending"` or `"descending"`. Other headers have no `aria-sort`.
   - The sort controls are real buttons inside the header cells.
   - The search input has a label (it may be visually hidden), and the result count is announced.

## Follow-up

- Add a third click that clears sorting. When is that useful?
- How would you sort and filter on the server instead? What changes in the component?
- The filter runs on every keystroke. When would you debounce it, and what would you debounce: the state update or the work?
