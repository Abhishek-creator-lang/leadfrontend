Design a reusable **data table component** for a design system used across an organisation's admin and analytics
products (think order lists, user management, transaction logs).

It must support:

- Sorting (single and multi-column), filtering, and pagination or infinite scrolling.
- Row selection (single, multi, select all), row actions, and expandable rows.
- Column resizing, reordering, hiding and pinning (sticky first column and header).
- Custom cell rendering (badges, avatars, links, inline edit).
- Data that is **client-side** (a few hundred rows) or **server-side** (millions of rows behind an API).

The interviewer adds: some tables show 50,000 rows at once (export previews, logs), and the component is used by
~30 teams with different needs. Discuss the API, state management, rendering performance, server integration and
accessibility.
