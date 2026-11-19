import React, { useState } from 'react';
import './styles.css';

const ORDERS = {
  row: 'Row by row',
  column: 'Column by column',
  snake: 'Snake (columns)',
};

// Value of the cell at (r, c), 0-based. A formula per cell: no 2D array to fill or mutate.
export function cellValue(r, c, rows, columns, order) {
  switch (order) {
    case 'row':
      return r * columns + c + 1;
    case 'column':
      return c * rows + r + 1;
    case 'snake':
      return c * rows + (c % 2 === 0 ? r : rows - 1 - r) + 1;
    default:
      throw new Error(`Unknown order ${order}`);
  }
}

function parseSize(raw) {
  const s = String(raw).trim();
  if (!/^\d+$/.test(s)) return null;
  const n = Number(s);
  return n >= 1 && n <= 20 ? n : null;
}

export default function App() {
  const [table, setTable] = useState(null); // { rows, columns, order }
  const [errors, setErrors] = useState({});

  function handleSubmit(event) {
    event.preventDefault();
    // Uncontrolled inputs: read everything once on submit.
    const data = new FormData(event.currentTarget);
    const rows = parseSize(data.get('rows'));
    const columns = parseSize(data.get('columns'));
    const next = {};
    if (rows === null) next.rows = 'Enter a whole number from 1 to 20.';
    if (columns === null) next.columns = 'Enter a whole number from 1 to 20.';
    setErrors(next);
    if (Object.keys(next).length > 0) return; // keep the previous table
    setTable({ rows, columns, order: data.get('order') });
  }

  const errorProps = (name) =>
    errors[name] ? { 'aria-invalid': true, 'aria-describedby': `${name}-error` } : {};

  return (
    <main className="generator">
      <h1>Table generator</h1>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="rows">Rows</label>
          <input id="rows" name="rows" inputMode="numeric" defaultValue="4" {...errorProps('rows')} />
          {errors.rows && (
            <p id="rows-error" className="error">
              {errors.rows}
            </p>
          )}
        </div>
        <div className="field">
          <label htmlFor="columns">Columns</label>
          <input id="columns" name="columns" inputMode="numeric" defaultValue="5" {...errorProps('columns')} />
          {errors.columns && (
            <p id="columns-error" className="error">
              {errors.columns}
            </p>
          )}
        </div>
        <div className="field">
          <label htmlFor="order">Fill order</label>
          <select id="order" name="order" defaultValue="row">
            {Object.entries(ORDERS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Generate</button>
      </form>

      {table && (
        <div className="table-wrapper">
          <table>
            <caption>
              {table.rows} × {table.columns} table, {ORDERS[table.order].toLowerCase()} order
            </caption>
            <tbody>
              {Array.from({ length: table.rows }, (_, r) => (
                <tr key={r}>
                  {Array.from({ length: table.columns }, (_, c) => (
                    <td key={c}>{cellValue(r, c, table.rows, table.columns, table.order)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
