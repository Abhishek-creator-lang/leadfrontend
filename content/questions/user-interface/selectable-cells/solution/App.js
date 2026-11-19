import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import './styles.css';

const ROWS = 6;
const COLS = 8;
const TOTAL = ROWS * COLS;

const rowOf = (i) => Math.floor(i / COLS);
const colOf = (i) => i % COLS;

/** All indices inside the rectangle spanned by cells a and b (inclusive). */
function rectangle(a, b) {
  const [r1, r2] = [rowOf(a), rowOf(b)].sort((x, y) => x - y);
  const [c1, c2] = [colOf(a), colOf(b)].sort((x, y) => x - y);
  const out = [];
  for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) out.push(r * COLS + c);
  return out;
}

const union = (base, extra) => {
  const next = new Set(base);
  extra.forEach((i) => next.add(i));
  return next;
};

// Memoised and callback-free (events are delegated), so a drag step only re-renders cells whose
// `selected` flag actually flipped.
const Cell = memo(function Cell({ index, selected, tabbable }) {
  return (
    <div
      role="gridcell"
      data-index={index}
      aria-selected={selected}
      tabIndex={tabbable ? 0 : -1}
      aria-label={`Row ${rowOf(index) + 1}, column ${colOf(index) + 1}`}
      className="cell"
    />
  );
});

export default function App() {
  const [selected, setSelected] = useState(() => new Set());
  const [active, setActive] = useState(0); // roving tabindex / keyboard focus
  // Ephemeral interaction data lives in refs: it changes on every mouse move but is never rendered.
  const dragRef = useRef(null); // { anchor, base } while the mouse button is held
  const anchorRef = useRef(0); // keyboard anchor for Shift+Arrow
  const gridRef = useRef(null);

  useEffect(() => {
    const end = () => (dragRef.current = null);
    window.addEventListener('mouseup', end);
    window.addEventListener('blur', end);
    return () => {
      window.removeEventListener('mouseup', end);
      window.removeEventListener('blur', end);
    };
  }, []);

  const indexOf = (target) => {
    const raw = target?.dataset?.index;
    return raw === undefined ? -1 : Number(raw);
  };

  const onMouseDown = (e) => {
    const index = indexOf(e.target);
    if (index < 0 || e.button !== 0) return;
    e.preventDefault(); // prevent text selection
    const additive = e.ctrlKey || e.metaKey;
    const base = additive ? selected : new Set();
    dragRef.current = { anchor: index, base, last: index };
    anchorRef.current = index;
    setActive(index);
    setSelected(union(base, rectangle(index, index)));
  };

  const onMouseOver = (e) => {
    const drag = dragRef.current;
    if (!drag) return;
    const index = indexOf(e.target);
    if (index < 0 || index === drag.last) return;
    drag.last = index;
    // Always recompute from the base + rectangle, so moving back shrinks the selection.
    setSelected(union(drag.base, rectangle(drag.anchor, index)));
  };

  const moveFocus = (index) => {
    setActive(index);
    gridRef.current.querySelector(`[data-index="${index}"]`)?.focus();
  };

  const onKeyDown = (e) => {
    const index = indexOf(e.target);
    if (index < 0) return;
    const r = rowOf(index);
    const c = colOf(index);
    let next = null;
    switch (e.key) {
      case 'ArrowRight':
        next = c < COLS - 1 ? index + 1 : index;
        break;
      case 'ArrowLeft':
        next = c > 0 ? index - 1 : index;
        break;
      case 'ArrowDown':
        next = r < ROWS - 1 ? index + COLS : index;
        break;
      case 'ArrowUp':
        next = r > 0 ? index - COLS : index;
        break;
      case ' ':
        e.preventDefault();
        anchorRef.current = index;
        setSelected((prev) => {
          const s = new Set(prev);
          s.has(index) ? s.delete(index) : s.add(index);
          return s;
        });
        return;
      case 'Escape':
        setSelected(new Set());
        return;
      case 'a':
      case 'A':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          setSelected(new Set(Array.from({ length: TOTAL }, (_, i) => i)));
        }
        return;
      default:
        return;
    }
    e.preventDefault();
    if (e.shiftKey) {
      setSelected(new Set(rectangle(anchorRef.current, next)));
    } else {
      anchorRef.current = next;
    }
    moveFocus(next);
  };

  const count = selected.size;
  const cells = useMemo(() => Array.from({ length: TOTAL }, (_, i) => i), []);

  return (
    <main className="app">
      <h1 id="slots-title">Pick your slots</h1>
      <div
        ref={gridRef}
        role="grid"
        aria-multiselectable="true"
        aria-labelledby="slots-title"
        aria-describedby="slots-help"
        className="grid"
        onMouseDown={onMouseDown}
        onMouseOver={onMouseOver}
        onKeyDown={onKeyDown}
      >
        {Array.from({ length: ROWS }, (_, r) => (
          <div role="row" key={r} className="row">
            {cells.slice(r * COLS, r * COLS + COLS).map((i) => (
              <Cell key={i} index={i} selected={selected.has(i)} tabbable={i === active} />
            ))}
          </div>
        ))}
      </div>
      <p id="slots-help" className="help">
        Drag to select. Hold Ctrl or ⌘ to add. Keyboard: arrows move, Space toggles, Shift+arrows extend, Escape clears.
      </p>
      <p role="status" className="status">
        {count} {count === 1 ? 'cell' : 'cells'} selected
      </p>
    </main>
  );
}
