import React from 'react';
import './styles.css';

const INITIAL_USERS = [
  { id: 1, first: 'Ada', last: 'Lovelace' },
  { id: 2, first: 'Grace', last: 'Hopper' },
  { id: 3, first: 'Alan', last: 'Turing' },
  { id: 4, first: 'Katherine', last: 'Johnson' },
];

// TODO:
// - users, selection, form draft and search query in state
// - search filter, sorted "Last, First" listbox with keyboard support
// - Create / Update / Delete / Cancel with the enabling rules from the prompt
// - announcements and focus management
export default function App() {
  const users = INITIAL_USERS;

  return (
    <main className="crud">
      <h1>Users</h1>
      <div className="layout">
        <section className="list-panel">
          <label>
            Search <input type="search" />
          </label>
          <ul className="list">
            {users.map((user) => (
              <li key={user.id}>
                {user.last}, {user.first}
              </li>
            ))}
          </ul>
        </section>
        <form className="form-panel" onSubmit={(e) => e.preventDefault()}>
          <label>
            First name <input />
          </label>
          <label>
            Last name <input />
          </label>
        </form>
      </div>
      <div className="actions">
        <button type="button">Create</button>
        <button type="button">Update</button>
        <button type="button">Delete</button>
        <button type="button">Cancel</button>
      </div>
    </main>
  );
}
