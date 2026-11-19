## State design

Four pieces of state, with everything else derived:

| State | Notes |
|---|---|
| `users` | The "database". An array of `{ id, first, last }`. |
| `query` | The search text |
| `selectedId` | Store the **id**, not the user object. A copied object goes stale after an update. |
| `draft` | `{ first, last }`: the form's controlled values |

Derived on each render:

- `visible`: filtered and sorted (`useMemo`, because sorting creates a new array). Sorting is presentation, so `users` stays in insertion order.
- `selected`: `users.find(u => u.id === selectedId)`
- `canCreate`, `canUpdate`, `canDelete`: the button-enabling rules, written as plain booleans. `isDirty` compares the **trimmed** draft with the stored user, so typing a trailing space doesn't enable Update.

Keeping the rules as named booleans next to each other makes them easy to review against the spec. It's also where interviewers look for bugs, such as Create being enabled while a user is selected (which creates a duplicate).

## Actions

- **Create:** builds the user from the trimmed draft and an id from a `useRef` counter (it survives re-renders and doesn't cause any; `crypto.randomUUID()` also works in modern browsers). Then it clears the form.
- **Update:** maps over `users`, replacing by id. It writes the trimmed values back into the draft so the form and the list agree.
- **Delete:** filters by id, clears the selection, and **moves focus to the listbox**. The focused Delete button is about to become `disabled`, and a disabled focused element drops focus to `<body>`, which is a real keyboard trap.
- **Cancel:** clears the selection and the draft.
- **Search:** if the selected user no longer matches, the selection is cleared. Otherwise Update and Delete would act on a row the user can't see.

## Accessibility: the listbox pattern

- `role="listbox"` on the `<ul>`, `role="option"` plus `aria-selected` on each `<li>`.
- **One tab stop** via `aria-activedescendant`: DOM focus stays on the listbox, and the active option is referenced by id (built from `useId`, so it's unique per instance). Arrow keys, <kbd>Home</kbd> and <kbd>End</kbd> move the selection, and *selection follows focus*, which is the APG recommendation for single-select listboxes where selecting is cheap. `scrollIntoView({ block: 'nearest' })` keeps the active option visible.
- The selected option is styled by `[aria-selected="true"]`, so the visuals can't drift from the semantics.
- Visible `<label>`s wrap every input. The form's accessible name changes between "New user" and "Edit Lovelace, Ada" to signal the mode.
- Results are announced in a polite `role="status"` region ("Deleted Turing, Alan").
- Pressing <kbd>Enter</kbd> in a field submits, which means Update in edit mode and Create otherwise.

## Edge cases

- Whitespace-only names: blocked by the trimmed checks.
- Duplicate names are allowed (people share names). Ids keep them distinct, and React keys use the id, never the name or the index.
- An empty search result shows "No users match …" instead of an empty box.
- Deleting the last visible user leaves the listbox empty but still focusable.

## Productionising: a real API

- **Server state:** fetch `GET /users?query=…` (debounced, cancel stale requests) and keep it in a server cache (TanStack Query). Mutations become `POST`, `PATCH /users/:id` and `DELETE /users/:id`.
- **Optimistic updates:** apply the change locally, roll back on error, and show an error toast. For deletes, consider an "Undo" snackbar instead of a confirmation dialog.
- **Pending states:** disable the specific action, not the whole UI. Guard against double submits.
- **Validation:** client-side for UX, server-side for truth. Show field errors with `aria-describedby` and `aria-invalid`.
- **Unsaved changes:** if `isDirty` and the user selects someone else, ask first (or autosave).

## Scale: 50,000 users

1. Rendering 50k `<li>`s is the first thing to break. **Virtualise** the listbox (render about 20 rows, keep `aria-setsize`/`aria-posinset` on the rendered options).
2. Filtering and sorting 50k items per keystroke is noticeable. Debounce the query, use `useDeferredValue`, or precompute a lower-cased search key. At that size, search should be server-side anyway.
3. `users.find` for the selected user becomes O(n). Keep a `Map` by id or a normalised `{ byId, allIds }` store.

## Follow-ups

- *"Why store `selectedId` instead of the user?"* A stored object is a snapshot. After Update, it would show stale names.
- *"Controlled or uncontrolled inputs?"* Controlled, because Select must write into them and the button rules read them on every render.
- *"How would you test this?"* By role and label: `getByRole('option', { name })`, `getByLabelText('First name')`, and asserting on `disabled`, `aria-selected` and the status text. That's exactly the test file here.
