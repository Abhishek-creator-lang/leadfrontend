import React, { useId, useMemo, useState } from 'react';

/**
 * Column definition:
 * {
 *   key: string,                       // unique, also the default field name
 *   label: string,                     // header text
 *   value?: (row) => any,              // accessor used for sorting/filtering (default: row[key])
 *   render?: (row) => ReactNode,       // cell renderer (default: the value)
 *   sortable?: boolean,                // default true
 *   compare?: (a, b) => number,        // custom comparator on values
 *   filter?: 'text' | 'range',         // optional per-column filter
 * }
 */

const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });

function defaultCompare(a, b) {
  if (a == null) return b == null ? 0 : 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return collator.compare(String(a), String(b));
}

const getValue = (column, row) => (column.value ? column.value(row) : row[column.key]);

function matchesFilter(column, value, filter) {
  if (filter == null) return true;
  if (column.filter === 'text') {
    const needle = filter.trim().toLowerCase();
    return needle === '' || String(value ?? '').toLowerCase().includes(needle);
  }
  if (column.filter === 'range') {
    const { min = '', max = '' } = filter;
    if (min !== '' && !(value >= Number(min))) return false;
    if (max !== '' && !(value <= Number(max))) return false;
    return true;
  }
  return true;
}

export default function DataTable({ caption, data, columns, getRowId = (row) => row.id, pageSizes = [5, 10, 20] }) {
  const [sort, setSort] = useState(null); // { key, direction }
  const [filters, setFilters] = useState({}); // { [key]: string | { min, max } }
  const [pageSize, setPageSize] = useState(pageSizes[0]);
  const [page, setPage] = useState(1);
  const id = useId();
  const headingId = `${id}-heading`;

  const filterableColumns = columns.filter((c) => c.filter);

  const visibleRows = useMemo(() => {
    const filtered = data.filter((row) =>
      columns.every((col) => matchesFilter(col, getValue(col, row), filters[col.key]))
    );
    if (!sort) return filtered;
    const column = columns.find((c) => c.key === sort.key);
    if (!column) return filtered; // columns changed and the sorted one is gone
    const compare = column.compare || defaultCompare;
    const factor = sort.direction === 'ascending' ? 1 : -1;
    return [...filtered].sort((a, b) => factor * compare(getValue(column, a), getValue(column, b)));
  }, [data, columns, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(visibleRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const rows = visibleRows.slice(start, start + pageSize);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const toggleSort = (key) => {
    setSort((prev) =>
      prev && prev.key === key
        ? { key, direction: prev.direction === 'ascending' ? 'descending' : 'ascending' }
        : { key, direction: 'ascending' }
    );
    setPage(1);
  };

  return (
    <section className="data-table-section" aria-labelledby={headingId}>
      <h2 id={headingId}>{caption}</h2>

      {filterableColumns.length > 0 && (
        <fieldset className="filters">
          <legend>Filters</legend>
          {filterableColumns.map((col) =>
            col.filter === 'text' ? (
              <label key={col.key} className="filter">
                <span>{col.label} contains</span>
                <input
                  type="search"
                  value={filters[col.key] ?? ''}
                  onChange={(e) => updateFilter(col.key, e.target.value)}
                />
              </label>
            ) : (
              <div key={col.key} className="filter filter--range" role="group" aria-label={`${col.label} range`}>
                <label>
                  <span>Minimum {col.label}</span>
                  <input
                    type="number"
                    value={filters[col.key]?.min ?? ''}
                    onChange={(e) => updateFilter(col.key, { ...filters[col.key], min: e.target.value })}
                  />
                </label>
                <label>
                  <span>Maximum {col.label}</span>
                  <input
                    type="number"
                    value={filters[col.key]?.max ?? ''}
                    onChange={(e) => updateFilter(col.key, { ...filters[col.key], max: e.target.value })}
                  />
                </label>
              </div>
            )
          )}
        </fieldset>
      )}

      <table className="data-table" aria-labelledby={headingId}>
        <thead>
          <tr>
            {columns.map((col) => {
              const sortable = col.sortable !== false;
              const direction = sort && sort.key === col.key ? sort.direction : undefined;
              return (
                <th key={col.key} scope="col" aria-sort={direction}>
                  {sortable ? (
                    <button type="button" className="sort-button" onClick={() => toggleSort(col.key)}>
                      {col.label}
                      <span aria-hidden="true" className="sort-icon">
                        {direction === 'ascending' ? '▲' : direction === 'descending' ? '▼' : '↕'}
                      </span>
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="empty">
                No matching rows.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={getRowId(row)}>
                {columns.map((col) => (
                  <td key={col.key} className={col.align === 'end' ? 'align-end' : undefined}>
                    {col.render ? col.render(row) : getValue(col, row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <nav className="pagination" aria-label={`${caption} pagination`}>
        <label className="page-size">
          Rows per page
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <div className="page-controls">
          <button type="button" aria-label="Previous page" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
            ‹
          </button>
          <span aria-live="polite" className="page-status">
            {`Page ${currentPage} of ${totalPages}`}
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
    </section>
  );
}
