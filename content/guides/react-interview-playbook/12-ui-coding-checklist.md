---
title: React UI coding checklist
description: A minute-by-minute playbook and checklist for React machine-coding rounds, covering clarifying, state design, building, accessibility, edge cases, and how to finish strong.
source: original
---
React UI coding rounds (sometimes called "machine coding") ask you to build a working component or mini-app in 45–90 minutes: an autocomplete, a kanban board, a paginated table, a nested comments widget. These rounds reward a repeatable process more than cleverness. This chapter gives you that process and a checklist to rehearse with.

## The 45-minute timeline

| Minutes | Phase | Output |
| --- | --- | --- |
| 0–5 | Clarify | Written requirements and assumptions |
| 5–10 | Design | State shape, component tree, data flow |
| 10–30 | Build the core | Working happy path |
| 30–38 | Edge cases and states | Loading, empty, error, boundaries |
| 38–43 | Accessibility and polish | Keyboard, ARIA, focus, basic styling |
| 43–45 | Wrap-up | What's left, how you'd test, what you'd improve |

For 60–90 minute rounds, stretch the build phase and add tests or extensions.

## Phase 1: clarify (write it down)

Questions to ask for nearly any component:

- What are the inputs? Props, static data, or an API? Is there a mock endpoint?
- What interactions matter most? Mouse, keyboard, touch?
- Controlled or uncontrolled? Will it be reused (design-system quality) or is it a one-off?
- How much data? (10 items vs 10,000 changes the approach.)
- Any styling expectations, or is functional markup fine?
- Which browsers or frameworks are allowed? Can I use libraries?

Put the answers in a comment at the top of the file.

## Phase 2: design state before markup

Write the state shape first, in a comment or a type:

```tsx
// Kanban board
type Card = { id: string; title: string };
type Column = { id: string; title: string; cardIds: string[] };
type BoardState = {
  cards: Record<string, Card>;     // normalized
  columns: Column[];
};
// Derived: card count per column (compute, don't store)
// Local UI: which card is being edited (in Card component)
```

State design rules:

- **Minimal:** store only what can't be derived.
- **Normalized** when items are referenced from several places or move between lists.
- **Colocated:** UI-only state lives in the component that uses it.
- **Explicit status:** use `'idle' | 'loading' | 'error' | 'success'` rather than several booleans.
- **Stable ids** for every list item, used as keys.

Sketch the component tree:

```text
Board
├── Column (×n)
│   ├── CardItem (×m)
│   └── AddCardForm
└── AddColumnButton
```

## Phase 3: build the core

- **Static markup first** with correct semantic elements. Then wire up state.
- **Get something on screen quickly.** Rendered output builds confidence and gives the interviewer something to react to.
- **Narrate:** "I'm putting the reducer at the board level because cards move between columns."
- **Use a reducer** when several actions touch the same state:

```tsx
type Action =
  | { type: 'addCard'; columnId: string; title: string }
  | { type: 'moveCard'; cardId: string; from: string; to: string; index: number }
  | { type: 'deleteCard'; cardId: string; columnId: string };

function reducer(state: BoardState, action: Action): BoardState {
  switch (action.type) {
    case 'addCard': {
      const id = crypto.randomUUID();
      return {
        cards: { ...state.cards, [id]: { id, title: action.title } },
        columns: state.columns.map((c) =>
          c.id === action.columnId ? { ...c, cardIds: [...c.cardIds, id] } : c
        ),
      };
    }
    case 'moveCard': {
      const columns = state.columns.map((c) => {
        if (c.id === action.from) c = { ...c, cardIds: c.cardIds.filter((id) => id !== action.cardId) };
        if (c.id === action.to) {
          const ids = [...c.cardIds];
          ids.splice(action.index, 0, action.cardId);
          c = { ...c, cardIds: ids };
        }
        return c;
      });
      return { ...state, columns };
    }
    case 'deleteCard': {
      const { [action.cardId]: _removed, ...cards } = state.cards;
      return {
        cards,
        columns: state.columns.map((c) =>
          c.id === action.columnId ? { ...c, cardIds: c.cardIds.filter((id) => id !== action.cardId) } : c
        ),
      };
    }
  }
}
```

- **Immutable updates only.** Never mutate arrays or objects in state.

## Phase 4: edge cases and states

Go through this list out loud:

| Category | Checks |
| --- | --- |
| Empty | No items, empty search results, empty input submitted |
| Loading | Initial load, subsequent loads (keep showing old data), button pending states |
| Error | Network failure, non-2xx response, retry option |
| Boundaries | First and last item in navigation, pagination limits, max lengths |
| Rapid input | Debounce, cancel stale requests, double clicks on submit |
| Async lifecycle | Component unmounts while a request is pending; parameters change mid-request |
| Data | Duplicates, very long strings, special characters, unicode |

## Phase 5: accessibility

Interviewers increasingly treat this as required, not optional.

- [ ] Semantic elements: `button` for actions, `a` for navigation, lists for lists, `form`/`label` for inputs
- [ ] Everything works with the keyboard: Tab order, Enter/Space on custom controls, Escape closes overlays
- [ ] Visible focus styles (don't remove outlines without a replacement)
- [ ] Use the matching ARIA pattern for complex widgets:

| Widget | Key ARIA |
| --- | --- |
| Tabs | `role="tablist"`, `tab`, `tabpanel`, `aria-selected`, arrow-key navigation |
| Modal dialog | `<dialog>` or `role="dialog"` + `aria-modal`, `aria-labelledby`, focus trap, focus return |
| Autocomplete | `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, `role="listbox"`/`option` |
| Accordion | Button with `aria-expanded` and `aria-controls` |
| Toast | `role="status"` (polite) or `role="alert"` (assertive) |
| Toggle | `aria-pressed` or a checkbox/switch role |

- [ ] Images have `alt`; icon-only buttons have `aria-label`
- [ ] Dynamic updates are announced (live regions) where useful
- [ ] Focus is managed after actions (opening a dialog, deleting an item, changing step)

## Phase 6: hooks hygiene

- [ ] Every effect has a clear external-system purpose, and derived data is computed instead
- [ ] Every subscription, timer, and listener has cleanup
- [ ] Fetches abort or ignore stale responses
- [ ] Functional updates where the next state depends on the previous one
- [ ] Dependency arrays are complete (no suppressed lint rules)
- [ ] No components defined inside other components
- [ ] Keys are stable ids, not indexes, for dynamic lists

## Phase 7: performance (mention, implement only if needed)

- Debounce search inputs (~200–300 ms).
- Virtualize lists of hundreds or thousands of rows.
- Memoize expensive derived data (`useMemo`) and memoize rows only if profiling shows a problem.
- Lazy-load heavy subcomponents.

## Wrap-up script

> "The core flows work: adding, moving, and deleting cards. I handled empty columns and long titles. Keyboard users can move cards with the menu, though I didn't finish drag-and-drop announcements. With more time I'd add those live-region messages, persist the board to localStorage, write RTL tests for the reducer and the add-card flow, and extract the column into a memoized component if boards get large."

This shows self-awareness, prioritization, and a plan, which is especially valuable if you didn't finish everything.

## Common question bank to practice

| Component | Key challenges |
| --- | --- |
| Autocomplete | Debounce, race conditions, keyboard nav, combobox ARIA, caching |
| Modal | Portal, focus trap/return, scroll lock, Escape, `<dialog>` |
| Tabs / Accordion | Compound components, keyboard patterns |
| Data table | Sort, filter, pagination, selection, virtualization |
| Infinite scroll feed | IntersectionObserver, loading states, dedupe |
| Nested comments / file tree | Recursion, normalized data, expand/collapse, tree ARIA |
| Star rating | Hover vs selected state, radio-group semantics |
| Todo with filters | Derived lists, URL state for the filter, persistence |
| Stopwatch / countdown | Intervals, drift (use timestamps), cleanup |
| Multi-step form | Validation per step, state persistence, focus management |
| Image carousel | Autoplay with pause, keyboard, reduced motion, lazy images |
| Kanban board | Normalized state, moving between lists, drag-and-drop a11y |

## Final checklist

- [ ] Requirements and assumptions written at the top
- [ ] State shape designed before markup; minimal and normalized where needed
- [ ] Happy path working by about 60% of the time
- [ ] Loading, empty, and error states
- [ ] Edge cases covered or explicitly mentioned
- [ ] Semantic HTML, keyboard support, focus management, ARIA pattern
- [ ] Effects cleaned up; no stale closures; stable keys
- [ ] Spoken summary with next steps and a testing plan
