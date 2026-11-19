import React from 'react';
import USERS from './users';
import './styles.css';

// TODO: show one page of users at a time.
// - "Rows per page" select with 5 / 10 / 20 (default 5)
// - Previous / Next buttons and a "Page X of Y" indicator
export function DataTable({ users }) {
  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Occupation</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.age}</td>
              <td>{user.occupation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  return <DataTable users={USERS} />;
}
