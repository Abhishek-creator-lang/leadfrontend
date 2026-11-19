Build a **kanban board** with three columns: **To do**, **In progress** and **Done**. Cards can be added, deleted and moved within and between columns.

The starter renders the columns and sample cards statically.

## Requirements

1. **Columns:** each column is a labelled region (named by its heading) containing a list of cards and a card count.
2. **Add:** each column has an input (`New card in To do`) and an **Add** button. Trimmed, non-empty titles are added to the bottom of that column. Clear the input afterwards.
3. **Delete:** each card has a `Delete <title>` button.
4. **Move with a pointer:** drag a card by its handle to another position in the same column or in a different column. Use Pointer Events with pointer capture, and highlight the column under the pointer.
5. **Move with the keyboard** (the drag alternative). Each card's handle is a button named `Move <title>`:
   - <kbd>Space</kbd>/<kbd>Enter</kbd> pick up the card (`aria-pressed="true"`)
   - <kbd>↑</kbd>/<kbd>↓</kbd> move it within its column
   - <kbd>←</kbd>/<kbd>→</kbd> move it to the previous or next column, keeping its index where possible (clamped)
   - <kbd>Space</kbd>/<kbd>Enter</kbd> drop it, and <kbd>Escape</kbd> cancels and restores the original position
   - Focus stays on the moved card's handle.
6. Announce moves politely, for example `Write tests moved to In progress, position 1 of 3.`
7. **State:** keep cards **normalised** (`cardsById` plus ordered `cardIds` per column) and update them through a reducer.

## Follow-up

- Persist moves to a server. How do you store order so a move doesn't rewrite every card?
- Two people move the same card at once. What happens?
- A column has 2,000 cards. What do you change?
