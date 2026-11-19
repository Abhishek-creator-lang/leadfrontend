import React, { memo, useEffect, useRef, useState } from 'react';
import './styles.css';

const SIZE = 16;

export const COLORS = [
  { name: 'Black', value: '#0f172a' },
  { name: 'White', value: '#ffffff' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#facc15' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
];

const emptyCanvas = () => Array(SIZE * SIZE).fill(null);

// Memoised: while dragging, only the cell whose colour changed re-renders.
// It receives no callbacks (events are delegated to the grid), so its props are all primitives.
const Cell = memo(function Cell({ index, colorIndex, tabbable }) {
  const row = Math.floor(index / SIZE) + 1;
  const col = (index % SIZE) + 1;
  const color = colorIndex == null ? null : COLORS[colorIndex];
  return (
    <div
      role="gridcell"
      data-index={index}
      tabIndex={tabbable ? 0 : -1}
      aria-label={`Row ${row}, column ${col}: ${color ? color.name : 'empty'}`}
      className="cell"
      style={color ? { background: color.value } : undefined}
    />
  );
});

function ChoiceGroup({ legend, name, options, value, onChange, renderLabel }) {
  return (
    <fieldset className="choice-group">
      <legend>{legend}</legend>
      {options.map((opt, i) => (
        <label key={opt} className="choice">
          <input type="radio" name={name} checked={value === i} onChange={() => onChange(i)} />
          {renderLabel(opt, i)}
        </label>
      ))}
    </fieldset>
  );
}

const TOOLS = ['Draw', 'Erase'];

export default function App() {
  const [cells, setCells] = useState(emptyCanvas);
  const [colorIndex, setColorIndex] = useState(0);
  const [tool, setTool] = useState(0); // index into TOOLS
  const [active, setActive] = useState(0); // roving tabindex position
  const paintingRef = useRef(false); // not state: it never affects what is rendered
  const gridRef = useRef(null);

  // Releasing the button anywhere (outside the canvas, outside the window) ends the stroke.
  useEffect(() => {
    const stop = () => (paintingRef.current = false);
    window.addEventListener('mouseup', stop);
    window.addEventListener('blur', stop);
    return () => {
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('blur', stop);
    };
  }, []);

  const apply = (index) => {
    const value = TOOLS[tool] === 'Erase' ? null : colorIndex;
    // Bail out when nothing changes so hovering over already-painted cells doesn't re-render.
    setCells((prev) => {
      if (prev[index] === value) return prev;
      const next = prev.slice();
      next[index] = value;
      return next;
    });
  };

  const indexOf = (target) => {
    const raw = target?.dataset?.index;
    return raw === undefined ? -1 : Number(raw);
  };

  const onMouseDown = (e) => {
    const index = indexOf(e.target);
    if (index < 0 || e.button !== 0) return;
    e.preventDefault(); // no text selection / native drag while painting
    paintingRef.current = true;
    setActive(index);
    apply(index);
  };

  // mouseover bubbles (mouseenter doesn't), so one listener on the grid covers every cell.
  const onMouseOver = (e) => {
    if (!paintingRef.current) return;
    const index = indexOf(e.target);
    if (index >= 0) apply(index);
  };

  const focusCell = (index) => {
    setActive(index);
    gridRef.current.querySelector(`[data-index="${index}"]`)?.focus();
  };

  const onKeyDown = (e) => {
    const index = indexOf(e.target);
    if (index < 0) return;
    const row = Math.floor(index / SIZE);
    const col = index % SIZE;
    let next = null;
    switch (e.key) {
      case 'ArrowRight':
        next = col < SIZE - 1 ? index + 1 : index;
        break;
      case 'ArrowLeft':
        next = col > 0 ? index - 1 : index;
        break;
      case 'ArrowDown':
        next = row < SIZE - 1 ? index + SIZE : index;
        break;
      case 'ArrowUp':
        next = row > 0 ? index - SIZE : index;
        break;
      case 'Home':
        next = row * SIZE;
        break;
      case 'End':
        next = row * SIZE + SIZE - 1;
        break;
      case ' ':
      case 'Enter':
        e.preventDefault();
        apply(index);
        return;
      default:
        return;
    }
    e.preventDefault();
    focusCell(next);
  };

  const rows = [];
  for (let r = 0; r < SIZE; r++) {
    const rowCells = [];
    for (let c = 0; c < SIZE; c++) {
      const i = r * SIZE + c;
      rowCells.push(<Cell key={i} index={i} colorIndex={cells[i]} tabbable={i === active} />);
    }
    rows.push(
      <div role="row" key={r} className="row">
        {rowCells}
      </div>
    );
  }

  return (
    <main className="app">
      <h1 id="pixel-title">Pixel art</h1>
      <div className="toolbar">
        <ChoiceGroup
          legend="Colour"
          name="color"
          options={COLORS.map((c) => c.name)}
          value={colorIndex}
          onChange={setColorIndex}
          renderLabel={(name, i) => (
            <>
              <span className="swatch" style={{ background: COLORS[i].value }} aria-hidden="true" />
              <span className="sr-only">{name}</span>
            </>
          )}
        />
        <ChoiceGroup
          legend="Tool"
          name="tool"
          options={TOOLS}
          value={tool}
          onChange={setTool}
          renderLabel={(name) => <span className="tool-label">{name}</span>}
        />
        <button type="button" className="clear" onClick={() => setCells(emptyCanvas())}>
          Clear
        </button>
      </div>

      <div
        ref={gridRef}
        role="grid"
        aria-labelledby="pixel-title"
        className="canvas"
        onMouseDown={onMouseDown}
        onMouseOver={onMouseOver}
        onKeyDown={onKeyDown}
      >
        {rows}
      </div>
    </main>
  );
}
