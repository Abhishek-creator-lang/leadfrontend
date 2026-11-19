import React, { useId, useMemo, useRef, useState } from 'react';
import './styles.css';

const INITIAL_USERS = [
  { id: 1, first: 'Ada', last: 'Lovelace' },
  { id: 2, first: 'Grace', last: 'Hopper' },
  { id: 3, first: 'Alan', last: 'Turing' },
  { id: 4, first: 'Katherine', last: 'Johnson' },
];

const EMPTY_DRAFT = { first: '', last: '' };
const displayName = (u) => `${u.last}, ${u.first}`;
const byName = (a, b) => a.last.localeCompare(b.last) || a.first.localeCompare(b.first);

export default function App() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [announcement, setAnnouncement] = useState('');
  const nextId = useRef(INITIAL_USERS.length + 1);
  const listRef = useRef(null);
  const baseId = useId();

  // Derived, never stored: the visible, sorted list and the selected user object.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => `${u.first} ${u.last}`.toLowerCase().includes(q)).sort(byName);
  }, [users, query]);
  const selected = users.find((u) => u.id === selectedId) ?? null;

  const first = draft.first.trim();
  const last = draft.last.trim();
  const isComplete = first !== '' && last !== '';
  const isDirty = selected !== null && (first !== selected.first || last !== selected.last);

  const canCreate = selected === null && isComplete;
  const canUpdate = selected !== null && isComplete && isDirty;
  const canDelete = selected !== null;

  function select(user) {
    setSelectedId(user.id);
    setDraft({ first: user.first, last: user.last });
  }

  function clear() {
    setSelectedId(null);
    setDraft(EMPTY_DRAFT);
  }

  function onSearch(value) {
    setQuery(value);
    const q = value.trim().toLowerCase();
    if (selected && !`${selected.first} ${selected.last}`.toLowerCase().includes(q)) clear();
  }

  function create() {
    if (!canCreate) return;
    const user = { id: nextId.current++, first, last };
    setUsers((prev) => [...prev, user]);
    clear();
    setAnnouncement(`Created ${displayName(user)}`);
  }

  function update() {
    if (!canUpdate) return;
    const updated = { ...selected, first, last };
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    setDraft({ first, last });
    setAnnouncement(`Updated ${displayName(updated)}`);
  }

  function remove() {
    if (!canDelete) return;
    setUsers((prev) => prev.filter((u) => u.id !== selected.id));
    clear();
    setAnnouncement(`Deleted ${displayName(selected)}`);
    // The Delete button is about to become disabled; don't strand focus on it.
    listRef.current?.focus();
  }

  // APG listbox (single select, selection follows focus) using aria-activedescendant.
  function onListKeyDown(event) {
    if (visible.length === 0) return;
    const index = visible.findIndex((u) => u.id === selectedId);
    let target;
    switch (event.key) {
      case 'ArrowDown':
        target = index === -1 ? 0 : Math.min(index + 1, visible.length - 1);
        break;
      case 'ArrowUp':
        target = index === -1 ? visible.length - 1 : Math.max(index - 1, 0);
        break;
      case 'Home':
        target = 0;
        break;
      case 'End':
        target = visible.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    select(visible[target]);
    document.getElementById(`${baseId}-opt-${visible[target].id}`)?.scrollIntoView?.({ block: 'nearest' });
  }

  return (
    <main className="crud">
      <h1>Users</h1>
      <div className="layout">
        <section className="list-panel" aria-label="User list">
          <label>
            Search
            <input type="search" value={query} onChange={(e) => onSearch(e.target.value)} />
          </label>
          <ul
            ref={listRef}
            className="list"
            role="listbox"
            aria-label="Users"
            tabIndex={0}
            aria-activedescendant={selected ? `${baseId}-opt-${selected.id}` : undefined}
            onKeyDown={onListKeyDown}
          >
            {visible.map((user) => (
              <li
                key={user.id}
                id={`${baseId}-opt-${user.id}`}
                role="option"
                aria-selected={user.id === selectedId}
                className="option"
                onClick={() => select(user)}
              >
                {displayName(user)}
              </li>
            ))}
          </ul>
          {visible.length === 0 && <p className="empty">No users match “{query}”.</p>}
        </section>

        <form
          className="form-panel"
          aria-label={selected ? `Edit ${displayName(selected)}` : 'New user'}
          onSubmit={(e) => {
            e.preventDefault();
            selected ? update() : create();
          }}
        >
          <label>
            First name
            <input value={draft.first} onChange={(e) => setDraft((d) => ({ ...d, first: e.target.value }))} />
          </label>
          <label>
            Last name
            <input value={draft.last} onChange={(e) => setDraft((d) => ({ ...d, last: e.target.value }))} />
          </label>
          {/* Enter in a field submits: create or update depending on the mode. */}
          <button type="submit" hidden tabIndex={-1} aria-hidden="true" />
        </form>
      </div>

      <div className="actions">
        <button type="button" onClick={create} disabled={!canCreate}>
          Create
        </button>
        <button type="button" onClick={update} disabled={!canUpdate}>
          Update
        </button>
        <button type="button" onClick={remove} disabled={!canDelete}>
          Delete
        </button>
        <button type="button" onClick={clear} disabled={!selected && !draft.first && !draft.last}>
          Cancel
        </button>
      </div>

      <p role="status" className="sr-only">
        {announcement}
      </p>
    </main>
  );
}
