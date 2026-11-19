import React, { useId, useState } from 'react';
import USERS from './users';
import './styles.css';

const PAGE_SIZES = [5, 10, 20];

const COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'age', label: 'Age' },
  { key: 'occupation', label: 'Occupation' },
];

// Paginated table from part I.
// TODO:
// - a "Search users" input that filters by name or occupation (case-insensitive)
// - sortable column headers (ascending, then descending) with aria-sort
// - filtering or sorting resets to page 1; show a message when nothing matches
export function DataTable({ users, initialPageSize = 5 }) {
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(1);
  const sizeSelectId = useId();

  // Derived values: never store what you can compute.
  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
  const currentPage = Math.min(page, totalPages); // stays valid if `users` shrinks
  const start = (currentPage - 1) * pageSize;
  const rows = users.slice(start, start + pageSize);

  const changePageSize = (event) => {
    setPageSize(Number(event.target.value));
    setPage(1); // the old page number means something else at a new size
  };

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <caption>Users</caption>
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th key={col.key} scope="col">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length} className="empty">
                No users.
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
          <select id={sizeSelectId} value={pageSize} onChange={changePageSize}>
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
