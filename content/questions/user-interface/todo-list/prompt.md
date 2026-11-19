Build a todo list. The starter shows the layout with three sample tasks, but nothing works.

## Requirements

1. **Add:** type into the "New task" input and press <kbd>Enter</kbd> or click **Add**. Trim whitespace and ignore empty input. After adding, clear the input and keep focus in it so the user can type the next task.
2. **Complete:** each task has a checkbox labelled with the task text. Completed tasks are shown struck through.
3. **Delete:** each task has a delete button whose accessible name includes the task ("Delete Buy milk"). After deleting, move focus somewhere sensible, not to `<body>`.
4. **Filters:** All / Active / Completed. The current filter is exposed to assistive tech with `aria-pressed`.
5. Show a count: "2 tasks left" (with correct singular/plural: "1 task left").
6. When the list is empty for the current filter, show a friendly message instead.

## Follow-up

- Why is the array index a bad `key` here?
- Add inline editing (double-click or an Edit button). What focus rules apply?
- How would you persist the list and sync it across browser tabs?
