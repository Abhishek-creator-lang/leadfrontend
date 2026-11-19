import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { addDays, addMonths, isSameDay, monthMatrix, parseISO, startOfDay, toISO } from './dateUtils';
import './styles.css';

const WEEKDAYS = [
  ['Su', 'Sunday'],
  ['Mo', 'Monday'],
  ['Tu', 'Tuesday'],
  ['We', 'Wednesday'],
  ['Th', 'Thursday'],
  ['Fr', 'Friday'],
  ['Sa', 'Saturday'],
];
const FOCUSABLE = 'button:not([disabled]), [tabindex="0"]';

export function DatePicker({ value, onChange, label = 'Date', today = new Date(), locale = 'en-US' }) {
  const selected = useMemo(() => (value ? parseISO(value) : null), [value]);
  const todayDate = startOfDay(today);

  const [text, setText] = useState(value || '');
  const [inputError, setInputError] = useState(false);
  const [open, setOpen] = useState(false);
  const [focusDate, setFocusDate] = useState(() => selected ?? todayDate);

  const rootRef = useRef(null);
  const dialogRef = useRef(null);
  const buttonRef = useRef(null);
  const gridRef = useRef(null);
  const focusGridRef = useRef(false); // move DOM focus into the grid on the next render?

  const uid = useId();
  const headingId = `${uid}-heading`;
  const hintId = `${uid}-hint`;
  const errorId = `${uid}-error`;
  const inputId = `${uid}-input`;

  const fullDate = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    [locale]
  );
  const monthTitle = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(focusDate);

  // Keep the text box in sync when the value changes from outside (or from the dialog).
  useEffect(() => {
    setText(value || '');
    setInputError(false);
  }, [value]);

  // Roving focus: after keyboard navigation or opening, focus the active day cell.
  useEffect(() => {
    if (!open || !focusGridRef.current) return;
    focusGridRef.current = false;
    gridRef.current?.querySelector(`[data-date="${toISO(focusDate)}"]`)?.focus();
  }, [open, focusDate]);

  // Click outside closes (focus isn't pulled back, because the user clicked elsewhere on purpose).
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  function openDialog() {
    setFocusDate(selected ?? todayDate);
    focusGridRef.current = true;
    setOpen(true);
  }

  function close() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  function choose(date) {
    onChange(toISO(date));
    close();
  }

  function commitText() {
    if (text.trim() === '') {
      setInputError(false);
      if (value) onChange('');
      return;
    }
    const parsed = parseISO(text);
    if (!parsed) {
      setInputError(true);
      return;
    }
    setInputError(false);
    if (toISO(parsed) !== value) onChange(toISO(parsed));
  }

  function moveFocus(date) {
    focusGridRef.current = true;
    setFocusDate(date);
  }

  function onGridKeyDown(event) {
    const d = focusDate;
    let next;
    switch (event.key) {
      case 'ArrowLeft':
        next = addDays(d, -1);
        break;
      case 'ArrowRight':
        next = addDays(d, 1);
        break;
      case 'ArrowUp':
        next = addDays(d, -7);
        break;
      case 'ArrowDown':
        next = addDays(d, 7);
        break;
      case 'Home':
        next = addDays(d, -d.getDay());
        break;
      case 'End':
        next = addDays(d, 6 - d.getDay());
        break;
      case 'PageUp':
        next = addMonths(d, event.shiftKey ? -12 : -1);
        break;
      case 'PageDown':
        next = addMonths(d, event.shiftKey ? 12 : 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        choose(d);
        return;
      default:
        return;
    }
    event.preventDefault();
    moveFocus(next);
  }

  function onDialogKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    // Focus trap: wrap Tab / Shift+Tab within the dialog.
    const focusables = Array.from(dialogRef.current.querySelectorAll(FOCUSABLE));
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const buttonLabel = selected ? `Choose date, selected date is ${fullDate.format(selected)}` : 'Choose date';
  const weeks = monthMatrix(focusDate);

  return (
    <div className="date-picker" ref={rootRef}>
      <div className="field">
        <label htmlFor={inputId}>{label}</label>
        <div className="input-row">
          <input
            id={inputId}
            type="text"
            inputMode="numeric"
            placeholder="YYYY-MM-DD"
            value={text}
            aria-invalid={inputError || undefined}
            aria-describedby={inputError ? `${hintId} ${errorId}` : hintId}
            onChange={(e) => setText(e.target.value)}
            onBlur={commitText}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commitText();
              }
            }}
          />
          <button
            ref={buttonRef}
            type="button"
            className="open-button"
            aria-label={buttonLabel}
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => (open ? setOpen(false) : openDialog())}
          >
            <span aria-hidden="true">📅</span>
          </button>
        </div>
        <span id={hintId} className="hint">
          Format: YYYY-MM-DD
        </span>
        {inputError && (
          <span id={errorId} className="error">
            Enter a date as YYYY-MM-DD
          </span>
        )}
      </div>

      {open && (
        <div
          ref={dialogRef}
          className="dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby={headingId}
          onKeyDown={onDialogKeyDown}
        >
          <div className="header">
            <button type="button" aria-label="Previous year" onClick={() => setFocusDate((d) => addMonths(d, -12))}>
              «
            </button>
            <button type="button" aria-label="Previous month" onClick={() => setFocusDate((d) => addMonths(d, -1))}>
              ‹
            </button>
            <h2 id={headingId} aria-live="polite">
              {monthTitle}
            </h2>
            <button type="button" aria-label="Next month" onClick={() => setFocusDate((d) => addMonths(d, 1))}>
              ›
            </button>
            <button type="button" aria-label="Next year" onClick={() => setFocusDate((d) => addMonths(d, 12))}>
              »
            </button>
          </div>

          <table ref={gridRef} role="grid" aria-labelledby={headingId} className="grid" onKeyDown={onGridKeyDown}>
            <thead>
              <tr>
                {WEEKDAYS.map(([short, long]) => (
                  <th key={short} scope="col" abbr={long}>
                    {short}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, w) => (
                <tr key={w}>
                  {week.map((date, i) => {
                    if (!date) return <td key={i} className="empty" />;
                    const isFocus = isSameDay(date, focusDate);
                    const isSelected = isSameDay(date, selected);
                    return (
                      <td
                        key={i}
                        role="gridcell"
                        data-date={toISO(date)}
                        tabIndex={isFocus ? 0 : -1}
                        aria-label={fullDate.format(date)}
                        aria-selected={isSelected}
                        aria-current={isSameDay(date, todayDate) ? 'date' : undefined}
                        className="day"
                        onClick={() => choose(date)}
                      >
                        {date.getDate()}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="footer">
            <button type="button" onClick={close}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [date, setDate] = useState('');
  return (
    <main>
      <h1>Book a meeting</h1>
      <DatePicker value={date} onChange={setDate} label="Meeting date" />
      <p className="chosen">Selected: {date || 'none'}</p>
    </main>
  );
}
