import React, { useEffect, useId, useRef, useState } from 'react';
import './styles.css';

const ITEMS = [
  { id: 'name', label: 'Name' },
  { id: 'email', label: 'Email' },
  { id: 'role', label: 'Role' },
  { id: 'team', label: 'Team' },
  { id: 'location', label: 'Location' },
  { id: 'joined', label: 'Joined' },
];

function SelectAll({ total, checkedCount, onChange, label }) {
  const ref = useRef(null);
  const all = total > 0 && checkedCount === total;
  useEffect(() => {
    ref.current.indeterminate = checkedCount > 0 && checkedCount < total;
  }, [checkedCount, total]);
  return (
    <input
      ref={ref}
      type="checkbox"
      aria-label={label}
      checked={all}
      disabled={total === 0}
      onChange={() => onChange(!all)}
    />
  );
}

function Panel({ title, items, checked, onToggle, onToggleAll }) {
  const titleId = useId();
  const checkedCount = items.filter((item) => checked.has(item.id)).length;

  return (
    <section className="panel" aria-labelledby={titleId}>
      <header className="panel-header">
        <SelectAll
          label={`Select all ${title.toLowerCase()}`}
          total={items.length}
          checkedCount={checkedCount}
          onChange={(value) => onToggleAll(items, value)}
        />
        <h2 id={titleId}>{title}</h2>
        <span className="count">
          {checkedCount}/{items.length} selected
        </span>
      </header>
      {items.length === 0 ? (
        <p className="empty">No items</p>
      ) : (
        <ul aria-labelledby={titleId}>
          {items.map((item) => (
            <li key={item.id}>
              <label className="option">
                <input type="checkbox" checked={checked.has(item.id)} onChange={() => onToggle(item.id)} />
                {item.label}
              </label>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function TransferList({ items }) {
  // Membership: each list keeps its own ordered array of items.
  const [left, setLeft] = useState(items);
  const [right, setRight] = useState([]);
  // One shared Set of checked ids: an id lives in exactly one list, so there's no ambiguity.
  const [checked, setChecked] = useState(() => new Set());

  const leftChecked = left.filter((item) => checked.has(item.id));
  const rightChecked = right.filter((item) => checked.has(item.id));

  const toggle = (id) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = (listItems, value) =>
    setChecked((prev) => {
      const next = new Set(prev);
      for (const item of listItems) value ? next.add(item.id) : next.delete(item.id);
      return next;
    });

  // Move `moving` from `from` to the end of `to`, and uncheck what moved.
  const move = (moving, setFrom, setTo) => {
    if (moving.length === 0) return;
    const ids = new Set(moving.map((item) => item.id));
    setFrom((prev) => prev.filter((item) => !ids.has(item.id)));
    setTo((prev) => [...prev, ...moving]);
    setChecked((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  };

  return (
    <div className="transfer">
      <Panel title="Available" items={left} checked={checked} onToggle={toggle} onToggleAll={toggleAll} />
      <div className="actions" role="group" aria-label="Transfer items">
        <button type="button" aria-label="Move all to Selected" disabled={left.length === 0} onClick={() => move(left, setLeft, setRight)}>
          <span aria-hidden="true">»</span>
        </button>
        <button type="button" aria-label="Move checked to Selected" disabled={leftChecked.length === 0} onClick={() => move(leftChecked, setLeft, setRight)}>
          <span aria-hidden="true">›</span>
        </button>
        <button type="button" aria-label="Move checked to Available" disabled={rightChecked.length === 0} onClick={() => move(rightChecked, setRight, setLeft)}>
          <span aria-hidden="true">‹</span>
        </button>
        <button type="button" aria-label="Move all to Available" disabled={right.length === 0} onClick={() => move(right, setRight, setLeft)}>
          <span aria-hidden="true">«</span>
        </button>
      </div>
      <Panel title="Selected" items={right} checked={checked} onToggle={toggle} onToggleAll={toggleAll} />
    </div>
  );
}

export default function App() {
  return <TransferList items={ITEMS} />;
}
