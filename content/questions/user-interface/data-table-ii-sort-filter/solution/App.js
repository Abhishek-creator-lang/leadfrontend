import React, { useId, useMemo, useState } from 'react';
import USERS from './users';
import './styles.css';

const PAGE_SIZES = [5, 10, 20];

const COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'age', label: 'Age' },
  { key: 'occupation', label: 'Occupation' },
];

const SEARCHABLE = ['name', 'occupation'];

const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });

function compareValues(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return collator.compare(String(a), String(b));
}

export function DataTable({ users, initialPageSize = 5 }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(null); // { key, direction: 'ascending' | 'descending' } | null
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(1);
  const searchId = useId();
  const sizeSelectId = useId();

  // Filter, then sort. Memoised so typing in an unrelated input elsewhere
  // or paging doesn't redo the work for large lists.
  const visibleUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? users.filter((user) => SEARCHABLE.some((key) => String(user[key]).toLowerCase().includes(needle)))
      : users;
    if (!sort) return filtered;
    const factor = sort.direction === 'ascending' ? 1 : -1;
    // Copy first: Array.prototype.sort mutates, and `users` is a prop.
    return [...filtered].sort((a, b) => factor * compareValues(a[sort.key], b[sort.key]));
  }, [users, query, sort]);

  const totalPages = Math.max(1, Math.ceil(visibleUsers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const rows = visibleUsers.slice(start, start + pageSize);

  const toggleSort = (key) => {
    setSort((prev) =>
      prev && prev.key === key
        ? { key, direction: prev.direction === 'ascending' ? 'descending' : 'ascending' }
        : { key, direction: 'ascending' }
    );
    setPage(1);
  };

  return (
    <div className="table-wrapper">
      <div className="toolbar">
        <label htmlFor={searchId} className="visually-hidden">
          Search users
        </label>
        <input
          id={searchId}
          type="search"
          placeholder="Search by name or occupation"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
        <span className="result-count" aria-live="polite">
          {`${visibleUsers.length} ${visibleUsers.length === 1 ? 'result' : 'results'}`}
        </span>
      </div>

      <table className="data-table">
        <caption>Users</caption>
        <thead>
          <tr>
            {COLUMNS.map((col) => {
              const direction = sort && sort.key === col.key ? sort.direction : undefined;
              return (
                // aria-sort goes on the header cell, and only on the column that is sorted.
                <th key={col.key} scope="col" aria-sort={direction}>
                  <button type="button" className="sort-button" onClick={() => toggleSort(col.key)}>
                    {col.label}
                    <span aria-hidden="true" className="sort-icon">
                      {direction === 'ascending' ? '▲' : direction === 'descending' ? '▼' : '↕'}
                    </span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length} className="empty">
                No users match “{query.trim()}”.
              </td>
            </tr>
          ) : (
            rows.map((user) => (
              <tr key={user.id}>
                {COLUMNS.map((col) => (
                  <td key={col.key}>{user[col.key]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <nav className="pagination" aria-label="Pagination">
        <div className="page-size">
          <label htmlFor={sizeSelectId}>Rows per page</label>
          <select
            id={sizeSelectId}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className="page-controls">
          <button
            type="button"
            aria-label="Previous page"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            ‹
          </button>
          <span aria-live="polite" className="page-status">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            aria-label="Next page"
            disabled={currentPage === totalPages}
            onClick={() => setPage(currentPage + 1)}
          >
            ›
          </button>
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return <DataTable users={USERS} />;
}
