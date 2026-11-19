import React, { useState } from 'react';
import { searchCountries } from './api';
import './styles.css';

// `searchCountries(query, { signal })` returns a Promise of [{ id, name }] (see api.js).
//
// TODO:
//  - debounce the query and call `search` (ignore stale / out-of-order responses)
//  - show results in a popup listbox with loading, empty and error states
//  - implement the WAI-ARIA combobox pattern: ArrowUp/Down, Enter, Escape, aria-activedescendant
//  - clicking an option selects it
export function Autocomplete({ label, search, onSelect }) {
  const [query, setQuery] = useState('');
  return (
    <div className="autocomplete">
      <label className="label">
        {label}
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Start typing…" />
      </label>
    </div>
  );
}

export default function App() {
  const [country, setCountry] = useState(null);
  return (
    <div className="app">
      <Autocomplete label="Country" search={searchCountries} onSelect={setCountry} />
      <p className="selection">{country ? `You picked ${country.name}` : 'No country picked yet'}</p>
    </div>
  );
}
