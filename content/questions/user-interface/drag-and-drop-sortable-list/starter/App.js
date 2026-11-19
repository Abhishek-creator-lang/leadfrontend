import React, { useState } from 'react';
import './styles.css';

const INITIAL = [
  { id: 'a', label: 'Fix login bug' },
  { id: 'b', label: 'Review PR #42' },
  { id: 'c', label: 'Update docs' },
  { id: 'd', label: 'Plan sprint' },
  { id: 'e', label: 'Refactor API client' },
];

// TODO:
// - pointer dragging on the handle (Pointer Events + pointer capture)
// - keyboard: Space/Enter pick up, arrows move, Space/Enter drop, Escape cancel
// - announcements in a live region, focus kept on the moving handle
export default function App() {
  const [items] = useState(INITIAL);

  return (
    <main>
      <h1>Priorities</h1>
      <ul className="sortable">
        {items.map((item) => (
          <li key={item.id} className="row">
            <span className="handle">⠿</span>
            {item.label}
          </li>
        ))}
      </ul>
    </main>
  );
}
