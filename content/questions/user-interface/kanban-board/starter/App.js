import React from 'react';
import './styles.css';

const INITIAL = {
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

// TODO:
// - reducer with add / delete / move actions over normalised state
// - pointer dragging between columns (Pointer Events + capture)
// - keyboard: pick up, arrows within/between columns, drop, Escape cancel; announcements
export default function App() {
  const board = INITIAL;

  return (
    <main>
      <h1>Sprint board</h1>
      <div className="board">
        {board.columns.map((column) => (
          <section key={column.id} className="column">
            <h2>{column.title}</h2>
            <ul className="cards">
              {column.cardIds.map((id) => (
                <li key={id} className="card">
                  {board.cardsById[id].title}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
