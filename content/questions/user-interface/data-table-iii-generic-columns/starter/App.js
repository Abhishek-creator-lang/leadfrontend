import React from 'react';
import { USERS, HOUSES } from './data';
import './styles.css';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

// Suggested column definitions. Feel free to change the shape.
const USER_COLUMNS = [
  { key: 'id', label: 'ID', sortable: false },
  { key: 'name', label: 'Name', filter: 'text' },
  { key: 'age', label: 'Age', filter: 'range' },
  { key: 'occupation', label: 'Occupation', filter: 'text' },
];

const HOUSE_COLUMNS = [
  { key: 'street', label: 'Street' },
  { key: 'city', label: 'City', filter: 'text' },
  { key: 'price', label: 'Price', filter: 'range', render: (house) => currency.format(house.price) },
  { key: 'builtYear', label: 'Built', filter: 'range' },
];

// TODO: this table only knows about users. Make it generic:
// - driven by a `columns` config (label, accessor, custom cell renderer, sortable, filter type)
// - sorting, per-column text/range filters and pagination, each table with its own state
// - render both a "Users" and a "Houses" table with it
export function DataTable({ data }) {
  return (
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
        {data.map((user) => (
          <tr key={user.id}>
            <td>{user.id}</td>
            <td>{user.name}</td>
            <td>{user.age}</td>
            <td>{user.occupation}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function App() {
  return (
    <main className="page">
      <DataTable data={USERS} />
    </main>
  );
}
