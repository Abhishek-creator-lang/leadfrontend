import React, { useEffect, useId, useRef, useState } from 'react';
import { searchCountries } from './api';
import './styles.css';

const DEBOUNCE_MS = 200;

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function Highlight({ text, query }) {
  const i = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (!query.trim() || i === -1) return text;
  const end = i + query.trim().length;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, end)}</mark>
      {text.slice(end)}
    </>
  );
}

export function Autocomplete({ label, search, onSelect }) {
  const id = useId();
  const listboxId = `${id}-listbox`;
  const optionId = (index) => `${id}-option-${index}`;

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [activeIndex, setActiveIndex] = useState(-1);
  const cache = useRef(new Map()); // query -> results

  const debouncedQuery = useDebouncedValue(query, DEBOUNCE_MS);

  useEffect(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) {
      setResults([]);
      setStatus('idle');
      return;
    }
    if (cache.current.has(q)) {
      setResults(cache.current.get(q));
      setStatus('success');
      setActiveIndex(-1);
      return;
    }

    // Each run owns an AbortController. When the query changes (or we unmount), cleanup aborts
    // the in-flight request, so a slow, stale response can never overwrite newer results.
    const controller = new AbortController();
    setStatus('loading');
    search(q, { signal: controller.signal }).then(
      (items) => {
        cache.current.set(q, items);
        setResults(items);
        setStatus('success');
        setActiveIndex(-1);
      },
      (err) => {
        if (err.name === 'AbortError') return;
        setResults([]);
        setStatus('error');
      }
    );
    return () => controller.abort();
  }, [debouncedQuery, search]);

  const hasQuery = query.trim().length > 0;
  const showList = open && hasQuery && results.length > 0;

  const select = (item) => {
    setQuery(item.name);
    setOpen(false);
    setActiveIndex(-1);
    onSelect?.(item);
  };

  const onKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!open) {
          setOpen(true);
          break;
        }
        if (results.length) setActiveIndex((i) => (i + 1) % results.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (results.length) setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
        break;
      case 'Enter':
        if (showList && activeIndex >= 0) {
          event.preventDefault();
          select(results[activeIndex]);
        }
        break;
      case 'Escape':
        if (open) {
          setOpen(false);
          setActiveIndex(-1);
        } else {
          setQuery(''); // second Escape clears, per the APG combobox pattern
        }
        break;
      default:
    }
  };

  let message = '';
  if (open && hasQuery) {
    if (status === 'loading') message = 'Loading…';
    else if (status === 'error') message = 'Something went wrong. Try again.';
    else if (status === 'success' && results.length === 0) message = 'No results';
    else if (status === 'success') message = `${results.length} result${results.length === 1 ? '' : 's'} available`;
  }

  return (
    <div className="autocomplete">
      <label htmlFor={`${id}-input`} className="label">
        {label}
      </label>
      <input
        id={`${id}-input`}
        type="text"
        role="combobox"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listboxId}
        aria-activedescendant={showList && activeIndex >= 0 ? optionId(activeIndex) : undefined}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onKeyDown={onKeyDown}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        placeholder="Start typing…"
      />
      <ul id={listboxId} role="listbox" aria-label={label} className="listbox" hidden={!showList}>
        {showList &&
          results.map((item, index) => (
            <li
              key={item.id}
              id={optionId(index)}
              role="option"
              aria-selected={index === activeIndex}
              className={`option${index === activeIndex ? ' option--active' : ''}`}
              // mousedown would blur the input (closing the list) before click fires.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(item)}
              onMouseMove={() => setActiveIndex(index)}
            >
              <Highlight text={item.name} query={query} />
            </li>
          ))}
      </ul>
      <div role="status" aria-live="polite" className={`message${showList ? ' sr-only' : ''}`}>
        {message}
      </div>
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
