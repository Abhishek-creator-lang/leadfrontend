import React from 'react';
import './styles.css';

const ITEMS = [
  { id: 'name', label: 'Name' },
  { id: 'email', label: 'Email' },
  { id: 'role', label: 'Role' },
  { id: 'team', label: 'Team' },
  { id: 'location', label: 'Location' },
  { id: 'joined', label: 'Joined' },
];

// TODO: track which items are in each list and which are checked.
// Wire up the four buttons (disabled when they'd do nothing) and the select-all header checkboxes.
export function TransferList({ items }) {
  return (
    <div className="transfer">
      <section className="panel">
        <h2>Available</h2>
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <label>
                <input type="checkbox" /> {item.label}
              </label>
            </li>
          ))}
        </ul>
      </section>
      <div className="actions">
        <button type="button">»</button>
        <button type="button">›</button>
        <button type="button">‹</button>
        <button type="button">«</button>
      </div>
      <section className="panel">
        <h2>Selected</h2>
        <p className="empty">No items</p>
      </section>
    </div>
  );
}

export default function App() {
  return <TransferList items={ITEMS} />;
}
