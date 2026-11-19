Build a `DataTable` that displays a list of users **one page at a time**.

The starter renders every user in a plain table. The data lives in `users.js` (23 users with `id`, `name`, `age` and `occupation`).

## Requirements

1. Show the columns **ID, Name, Age, Occupation**.
2. Show **5 rows per page** by default.
3. A **"Rows per page"** `<select>` offers 5, 10 and 20. Changing it goes back to **page 1**.
4. **Previous page** / **Next page** buttons move between pages. Previous is disabled on the first page and Next is disabled on the last page.
5. Show a `Page X of Y` indicator, e.g. `Page 2 of 5`.
6. Accessibility:
   - Use semantic table markup (`<table>`, `<caption>`, `<thead>`, `<th scope="col">`).
   - The select has a visible `<label>`.
   - The arrow buttons have accessible names (`"Previous page"`, `"Next page"`).
   - Screen-reader users hear the new page number when it changes.

## Follow-up

- What happens if the `users` prop shrinks while you're on the last page?
- How would this change if the server paginated the data (`?page=2&limit=10`)?
- Add sorting and filtering (see *Data Table II*).
