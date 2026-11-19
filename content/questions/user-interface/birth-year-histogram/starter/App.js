import React, { useState } from 'react';
import './styles.css';

export const BIRTH_YEARS = [
  1952, 1955, 1958, 1971, 1974, 1974, 1979, 1980, 1983, 1985, 1985, 1987, 1989, 1990, 1991, 1996,
];

// TODO:
// - bucket the years by `bucketSize` (keep empty buckets between min and max)
// - render one bar per bucket with label + count, scaled to the largest bucket
// - accessible names for bars ("1980–1989: 6 people") and a "Show as table" toggle
// - "Add a birth year" form with validation
export default function App() {
  const [years] = useState(BIRTH_YEARS);
  const [bucketSize, setBucketSize] = useState(10);

  return (
    <main className="app">
      <h1>Respondents by birth year</h1>
      <label>
        Bucket size{' '}
        <select value={bucketSize} onChange={(e) => setBucketSize(Number(e.target.value))}>
          <option value={1}>1</option>
          <option value={5}>5</option>
          <option value={10}>10</option>
        </select>
      </label>
      <div className="chart">{/* bars go here */}</div>
      <p>{years.length} responses</p>
    </main>
  );
}
