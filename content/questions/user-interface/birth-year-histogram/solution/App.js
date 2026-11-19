import React, { useId, useMemo, useState } from 'react';
import './styles.css';

export const BIRTH_YEARS = [
  1952, 1955, 1958, 1971, 1974, 1974, 1979, 1980, 1983, 1985, 1985, 1987, 1989, 1990, 1991, 1996,
];

const MIN_YEAR = 1900;
const BUCKET_SIZES = [1, 5, 10];

/** Pure, O(n + buckets). Returns [{ start, end, count }] covering min..max with no gaps. */
export function bucketize(years, size) {
  if (years.length === 0) return [];
  const startOf = (y) => Math.floor(y / size) * size;
  let min = Infinity;
  let max = -Infinity;
  const counts = new Map();
  for (const y of years) {
    const s = startOf(y);
    counts.set(s, (counts.get(s) ?? 0) + 1);
    if (s < min) min = s;
    if (s > max) max = s;
  }
  const buckets = [];
  for (let s = min; s <= max; s += size) {
    buckets.push({ start: s, end: s + size - 1, count: counts.get(s) ?? 0 });
  }
  return buckets;
}

const labelOf = ({ start, end }) => (start === end ? String(start) : `${start}–${end}`);
const people = (n) => `${n} ${n === 1 ? 'person' : 'people'}`;

function Histogram({ buckets }) {
  const max = Math.max(1, ...buckets.map((b) => b.count));
  return (
    // role="list" restores list semantics that Safari/VoiceOver drops when list-style is none.
    <ul role="list" className="chart" aria-label="Respondents per period">
      {buckets.map((b) => (
        <li key={b.start} className="bar-slot">
          <span className="sr-only">{`${labelOf(b)}: ${people(b.count)}`}</span>
          <span className="bar-count" aria-hidden="true">
            {b.count}
          </span>
          <span className="bar" aria-hidden="true" style={{ height: `${(b.count / max) * 100}%` }} />
          <span className="bar-label" aria-hidden="true">
            {labelOf(b)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function HistogramTable({ buckets }) {
  return (
    <table className="data-table">
      <caption>Respondents per period</caption>
      <thead>
        <tr>
          <th scope="col">Period</th>
          <th scope="col">People</th>
        </tr>
      </thead>
      <tbody>
        {buckets.map((b) => (
          <tr key={b.start}>
            <th scope="row">{labelOf(b)}</th>
            <td>{b.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AddYearForm({ onAdd }) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const inputId = useId();
  const errorId = useId();
  const maxYear = new Date().getFullYear();

  const submit = (e) => {
    e.preventDefault();
    const year = Number(draft);
    if (!/^\d{4}$/.test(draft.trim()) || year < MIN_YEAR || year > maxYear) {
      setError(`Enter a year between ${MIN_YEAR} and ${maxYear}`);
      return;
    }
    onAdd(year);
    setDraft('');
    setError('');
  };

  return (
    <form className="add-form" onSubmit={submit} noValidate>
      <label htmlFor={inputId}>Add a birth year</label>
      <input
        id={inputId}
        inputMode="numeric"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      <button type="submit">Add</button>
      {error && (
        <p id={errorId} className="error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

export default function App() {
  const [years, setYears] = useState(BIRTH_YEARS);
  const [bucketSize, setBucketSize] = useState(10);
  const [asTable, setAsTable] = useState(false);

  // Bucketing is the only non-trivial computation; memoize so unrelated re-renders
  // (typing in the form) don't recompute it for large datasets.
  const buckets = useMemo(() => bucketize(years, bucketSize), [years, bucketSize]);

  return (
    <main className="app">
      <h1>Respondents by birth year</h1>
      <div className="toolbar">
        <label>
          Bucket size{' '}
          <select value={bucketSize} onChange={(e) => setBucketSize(Number(e.target.value))}>
            {BUCKET_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <button type="button" aria-pressed={asTable} onClick={() => setAsTable((v) => !v)}>
          Show as table
        </button>
      </div>

      <figure className="figure">
        {buckets.length === 0 ? (
          <p>No data yet.</p>
        ) : asTable ? (
          <HistogramTable buckets={buckets} />
        ) : (
          <Histogram buckets={buckets} />
        )}
        <figcaption>{people(years.length)} responded</figcaption>
      </figure>

      <AddYearForm onAdd={(y) => setYears((prev) => [...prev, y])} />
    </main>
  );
}
