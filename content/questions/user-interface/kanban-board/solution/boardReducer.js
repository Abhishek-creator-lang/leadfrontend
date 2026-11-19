// Normalised board state:
//   columns:   [{ id, title, cardIds: [...] }]   ← order lives here only
//   cardsById: { [id]: { id, title } }           ← card data lives here only
// Moving a card touches at most two `cardIds` arrays and never copies card objects.

export const INITIAL_BOARD = {
  columns: [
    { id: 'todo', title: 'To do', cardIds: ['c1', 'c2', 'c3'] },
    { id: 'doing', title: 'In progress', cardIds: ['c4', 'c5'] },
    { id: 'done', title: 'Done', cardIds: ['c6'] },
  ],
  cardsById: {
    c1: { id: 'c1', title: 'Write tests' },
    c2: { id: 'c2', title: 'Design empty states' },
    c3: { id: 'c3', title: 'Audit bundle size' },
    c4: { id: 'c4', title: 'Migrate to React 18' },
    c5: { id: 'c5', title: 'Fix flaky CI job' },
    c6: { id: 'c6', title: 'Set up linting' },
  },
};

/** { columnIndex, index } of a card, or null. */
export function locate(board, cardId) {
  for (let c = 0; c < board.columns.length; c++) {
    const index = board.columns[c].cardIds.indexOf(cardId);
    if (index !== -1) return { columnIndex: c, index };
  }
  return null;
}

let nextId = 100;

export function boardReducer(board, action) {
  switch (action.type) {
    case 'add': {
      const title = action.title.trim();
      if (!title) return board;
      const id = action.id ?? `c${nextId++}`;
      return {
        cardsById: { ...board.cardsById, [id]: { id, title } },
        columns: board.columns.map((col) =>
          col.id === action.columnId ? { ...col, cardIds: [...col.cardIds, id] } : col
        ),
      };
    }
    case 'delete': {
      const { [action.cardId]: _removed, ...cardsById } = board.cardsById;
      return {
        cardsById,
        columns: board.columns.map((col) =>
          col.cardIds.includes(action.cardId)
            ? { ...col, cardIds: col.cardIds.filter((id) => id !== action.cardId) }
            : col
        ),
      };
    }
    case 'move': {
      const { cardId, toColumnIndex, toIndex } = action;
      const from = locate(board, cardId);
      if (!from || toColumnIndex < 0 || toColumnIndex >= board.columns.length) return board;
      if (from.columnIndex === toColumnIndex && from.index === toIndex) return board;
      const columns = board.columns.map((col) => ({ ...col, cardIds: col.cardIds.slice() }));
      columns[from.columnIndex].cardIds.splice(from.index, 1);
      const target = columns[toColumnIndex].cardIds;
      target.splice(Math.max(0, Math.min(toIndex, target.length)), 0, cardId);
      return { ...board, columns };
    }
    case 'restore':
      return action.board;
    default:
      throw new Error(`Unknown action ${action.type}`);
  }
}
