## State design

| State | Notes |
|---|---|
| `todos: { id, text, done }[]` | Source of truth |
| `text` | Controlled input value |
| `filter: 'All' \| 'Active' \| 'Completed'` | UI state |

Derived during render: `visible` (the filtered list) and `remaining`. Don't store `filteredTodos` in state; it would go stale the moment a task is toggled.

Filters are a lookup of predicates (`FILTERS[filter]`). Adding a filter means adding one line, and the button list is generated from the same object.

All updates are **immutable** (`map`, `filter`, spread) and use updater functions, so React sees new references and re-renders, and concurrent updates never overwrite each other.

## Keys

Ids are stable and unique. Index keys are a real bug here, not just style. Delete the first task and React reuses the first `<li>` (including its DOM checkbox state and focus) for what used to be the second task. With filters, the same index means different tasks in different views. In production, ids come from the server or `crypto.randomUUID()`.

## Forms and accessibility

- A real `<form onSubmit>` gives <kbd>Enter</kbd>-to-submit for free, and works with password managers and autofill conventions. `preventDefault()` stops a page reload.
- The input has a label (visually hidden). A placeholder is **not** a label: it disappears as you type and has poor contrast.
- Each checkbox is wrapped in a `<label>` with the task text, so its accessible name is the task and the whole row is clickable.
- The delete button's visible "×" is `aria-hidden`, and `aria-label="Delete Buy milk"` makes each button's name unique. Five buttons all called "times" would be useless in a screen reader's buttons list.
- Filter buttons use `aria-pressed` inside a labelled `role="group"`. (Tabs would be wrong: the filter changes a list, it doesn't switch panels.)
- The count is in `role="status"`, so changes are announced politely.
- Strikethrough plus grey text plus the checked checkbox: done-ness isn't conveyed by style alone.

## Focus management

This is what separates good answers:

- **After adding**, focus stays in the input for rapid entry.
- **After deleting**, the focused button disappears and focus would fall to `<body>`, so keyboard and screen-reader users lose their place. Move focus to the next item's delete button, else the previous one, else the heading (`tabIndex={-1}` makes it programmatically focusable). Refs are kept in a `Map` keyed by id, which stays correct as items come and go.

Calling `focus()` right after `setTodos` works because the neighbour's button already exists in the DOM. If the target only appears after the update, focus it in an effect or with `flushSync`.

## Edge cases

- Whitespace-only input is ignored; text is trimmed.
- Duplicate texts are allowed: ids, not text, identify tasks.
- Pluralisation: "1 task left". For i18n, use `Intl.PluralRules` or the i18n library's plural support.
- Very long task text: let it wrap (`overflow-wrap: anywhere`).

## Scaling and productionizing

- **Persistence:** lazy-init from `localStorage` with `useState(() => JSON.parse(...))` and save in an effect. Listen to the `storage` event to sync tabs.
- **Server-backed:** a query cache with optimistic mutations, and rollback on error.
- **Large lists:** memoise row components (`React.memo` with stable callbacks via `useCallback` or a reducer `dispatch`), and virtualise beyond a few hundred rows.
- **`useReducer`:** once you add edit, clear-completed and reorder, a reducer centralises transitions and makes them unit-testable.

## Follow-ups

- **Inline edit:** swap the label for an input, autofocus it, <kbd>Enter</kbd> saves, <kbd>Escape</kbd> cancels, and return focus to the Edit button afterwards.
- **Clear completed** and **toggle all** buttons.
- **Reordering:** drag and drop needs a keyboard alternative (Move up and Move down buttons).
