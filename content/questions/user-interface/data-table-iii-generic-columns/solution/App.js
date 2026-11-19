import React from 'react';
import DataTable from './DataTable';
import { USERS, HOUSES } from './data';
import './styles.css';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

// Column definitions live at module scope so their identity is stable across
// renders; DataTable's useMemo depends on `columns`.
const USER_COLUMNS = [
  { key: 'id', label: 'ID', sortable: false },
  { key: 'name', label: 'Name', filter: 'text' },
  { key: 'age', label: 'Age', filter: 'range', align: 'end' },
  { key: 'occupation', label: 'Occupation', filter: 'text' },
];

const HOUSE_COLUMNS = [
  { key: 'street', label: 'Street' },
  { key: 'city', label: 'City', filter: 'text' },
  {
    key: 'price',
    label: 'Price',
    filter: 'range',
    align: 'end',
    // Sort and filter on the raw number, display the formatted string.
    render: (house) => currency.format(house.price),
  },
  { key: 'builtYear', label: 'Built', filter: 'range', align: 'end' },
];

export default function App() {
  return (
    <main className="page">
      <DataTable caption="Users" data={USERS} columns={USER_COLUMNS} />
      <DataTable caption="Houses" data={HOUSES} columns={HOUSE_COLUMNS} />
    </main>
  );
}
