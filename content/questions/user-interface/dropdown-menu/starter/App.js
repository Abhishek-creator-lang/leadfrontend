import React, { useState } from 'react';
import './styles.css';

// TODO: implement the WAI-ARIA menu button pattern:
// open/close, focus management, arrow keys, Home/End, typeahead, Escape, Tab, outside click,
// disabled items, and the ARIA attributes on the button, menu and items.
export function MenuButton({ label, items }) {
  return (
    <div className="menu-root">
      <button type="button" className="menu-button">
        {label} <span aria-hidden="true">▾</span>
      </button>
      <ul className="menu">
        {items.map((item) => (
          <li key={item.id} className="menu-item" onClick={item.onSelect}>
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  const [last, setLast] = useState('none');
  const items = [
    { id: 'edit', label: 'Edit', onSelect: () => setLast('Edit') },
    { id: 'duplicate', label: 'Duplicate', onSelect: () => setLast('Duplicate') },
    { id: 'archive', label: 'Archive', onSelect: () => setLast('Archive'), disabled: true },
    { id: 'delete', label: 'Delete', onSelect: () => setLast('Delete') },
  ];

  return (
    <main className="page">
      <MenuButton label="Actions" items={items} />
      <p className="last">Last action: {last}</p>
    </main>
  );
}
