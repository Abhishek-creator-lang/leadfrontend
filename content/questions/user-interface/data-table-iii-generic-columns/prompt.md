Your team now needs tables for more than users. The starter has a table that only knows how to render users, plus two datasets in `data.js`: `USERS` and `HOUSES`.

Build a **reusable `DataTable`** that is configured by a list of **column definitions**, and use it to render a **Users** table and a **Houses** table on the same page.

## Requirements

1. `DataTable` accepts `caption`, `data` and `columns`. It must not contain anything user- or house-specific.
2. A column definition supports at least:
   - `key` and `label`
   - an optional **accessor** for the value (defaults to `row[key]`)
   - an optional **cell renderer** (e.g. house prices are shown as `$485,000`)
   - `sortable` (default `true`); non-sortable columns render a plain header with no button
   - an optional **filter type**: `'text'` (contains, case-insensitive) or `'range'` (numeric min/max)
3. **Sorting** works like part II (ascending, then descending, with `aria-sort` on the sorted `<th>`). It must sort by the **raw value**, not the rendered text: `$1,250,000` is more than `$297,500`.
4. **Filters** are rendered automatically from the column config, each with a label: `"<Label> contains"` for text, and `"Minimum <Label>"` / `"Maximum <Label>"` for ranges. Empty inputs don't filter. All filters combine with AND.
5. **Pagination** (5/10/20 rows per page) as in part I. Filtering or sorting resets to page 1.
6. Each table instance has **independent state**, and its table and section are named by its caption (so you can find "the Houses table" by role and name).

## Follow-up

- Should `DataTable` own its sort/filter/page state, or should the parent? Design a controlled API.
- How would you let consumers add a column of row actions (Edit / Delete)?
- How would the column API change if the data came from a server with server-side sorting and filtering?
- How would you type the column definitions in TypeScript so `key` must be a key of the row type?
