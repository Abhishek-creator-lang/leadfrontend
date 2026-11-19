Build a small **users database** UI: a searchable list of people, a form with **First name** and **Last name** fields, and four actions: **Create**, **Update**, **Delete** and **Cancel**. Everything lives in memory. There's no backend.

The starter has the sample users, the layout and the buttons, but nothing is wired up.

## Requirements

1. **List:** show every user as `Last, First`, sorted by last name, then first name.
2. **Search:** a **Search** field filters the list, case-insensitively, by any part of the full name. If the selected user is filtered out, the selection is cleared.
3. **Select:** clicking a user selects them and copies their names into the form.
4. **Create:** adds a new user from the form. Names are trimmed. It's only available when **no** user is selected and both trimmed fields are non-empty. Afterwards, clear the form.
5. **Update:** saves the form into the selected user. It's only available when a user is selected, both fields are non-empty, and something actually changed.
6. **Delete:** removes the selected user. It's only available when a user is selected. Afterwards, clear the selection and the form.
7. **Cancel:** clears the selection and the form.
8. Accessibility:
   - The list follows the WAI-ARIA **listbox** pattern: `role="listbox"` with `role="option"` items, `aria-selected`, and a single tab stop. <kbd>↑</kbd>/<kbd>↓</kbd>/<kbd>Home</kbd>/<kbd>End</kbd> move the selection, and selection follows focus.
   - Inputs have visible labels.
   - Each action is announced politely, for example `Created Lovelace, Ada` or `Deleted Turing, Alan`.
   - After Delete, focus moves to the list instead of being lost on a now-disabled button.

## Follow-up

- Persist to a REST API. What changes about state, loading and errors? Would you update optimistically?
- The list grows to 50,000 users. What breaks first?
- Add an "unsaved changes" guard when switching users with a dirty form.
