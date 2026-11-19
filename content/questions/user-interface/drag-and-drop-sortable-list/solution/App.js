import React, { useEffect, useId, useRef, useState } from 'react';
import './styles.css';

const INITIAL = [
  { id: 'a', label: 'Fix login bug' },
  { id: 'b', label: 'Review PR #42' },
  { id: 'c', label: 'Update docs' },
  { id: 'd', label: 'Plan sprint' },
  { id: 'e', label: 'Refactor API client' },
];

/** Returns a new array with the element at `from` moved to `to`. */
export function move(list, from, to) {
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function SortableList({ initialItems, onReorder }) {
  const [items, setItems] = useState(initialItems);
  // Keyboard "grab": which item is held and where it started (for Escape).
  const [held, setHeld] = useState(null); // { id, from, snapshot }
  // Pointer drag: which item is being dragged.
  const [dragId, setDragId] = useState(null);
  const [announcement, setAnnouncement] = useState('');
  const handleRefs = useRef(new Map());
  const rowRefs = useRef(new Map());
  const focusAfterMove = useRef(null);
  const instructionsId = useId();

  const total = items.length;
  const indexOf = (id, list = items) => list.findIndex((it) => it.id === id);
  const labelOf = (id) => items.find((it) => it.id === id)?.label ?? '';

  // Reordering moves DOM nodes, which can drop focus. Restore it on the moved handle.
  useEffect(() => {
    if (focusAfterMove.current) {
      handleRefs.current.get(focusAfterMove.current)?.focus();
      focusAfterMove.current = null;
    }
  }, [items]);

  function commit(next) {
    setItems(next);
    onReorder?.(next);
  }

  // ---------- Keyboard ----------
  function onHandleKeyDown(event, id) {
    const index = indexOf(id);
    const isHeld = held?.id === id;

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (!isHeld) {
        setHeld({ id, from: index, snapshot: items });
        setAnnouncement(`Picked up ${labelOf(id)}. Position ${index + 1} of ${total}.`);
      } else {
        setHeld(null);
        onReorder?.(items);
        setAnnouncement(`Dropped ${labelOf(id)} at position ${index + 1} of ${total}.`);
      }
      return;
    }
    if (!isHeld) return;

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const to = event.key === 'ArrowUp' ? index - 1 : index + 1;
      if (to < 0 || to >= total) return;
      focusAfterMove.current = id;
      setItems(move(items, index, to));
      setAnnouncement(`${labelOf(id)} moved to position ${to + 1} of ${total}.`);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      focusAfterMove.current = id;
      setItems(held.snapshot);
      setHeld(null);
      setAnnouncement(`Reorder cancelled. ${labelOf(id)} returned to position ${held.from + 1} of ${total}.`);
    }
  }

  // ---------- Pointer ----------
  function onPointerDown(event, id) {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDragId(id);
    setAnnouncement(`Picked up ${labelOf(id)}.`);
  }

  function onPointerMove(event) {
    if (!dragId) return;
    const from = indexOf(dragId);
    // Target index = number of *other* rows whose vertical midpoint is above the pointer.
    let to = 0;
    items.forEach((item) => {
      if (item.id === dragId) return;
      const rect = rowRefs.current.get(item.id)?.getBoundingClientRect();
      if (rect && event.clientY > rect.top + rect.height / 2) to += 1;
    });
    if (to !== from) setItems((prev) => move(prev, from, to));
  }

  function onPointerUp(event) {
    if (!dragId) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    const position = indexOf(dragId) + 1;
    setAnnouncement(`Dropped ${labelOf(dragId)} at position ${position} of ${total}.`);
    setDragId(null);
    commit(items);
  }

  function onPointerCancel() {
    setDragId(null);
  }

  return (
    <>
      <p id={instructionsId} className="sr-only">
        Press Space or Enter to pick up. Use the up and down arrow keys to move, Space or Enter to drop, and Escape to
        cancel.
      </p>
      <ul className="sortable" aria-label="Priorities">
        {items.map((item) => {
          const isHeld = held?.id === item.id;
          const isDragging = dragId === item.id;
          return (
            <li
              key={item.id}
              ref={(el) => (el ? rowRefs.current.set(item.id, el) : rowRefs.current.delete(item.id))}
              className={`row${isHeld || isDragging ? ' row--lifted' : ''}`}
            >
              <button
                ref={(el) => (el ? handleRefs.current.set(item.id, el) : handleRefs.current.delete(item.id))}
                type="button"
                className="handle"
                aria-label={`Reorder ${item.label}`}
                aria-describedby={instructionsId}
                aria-pressed={isHeld}
                onKeyDown={(e) => onHandleKeyDown(e, item.id)}
                onBlur={(e) => {
                  // Tabbing away while holding drops the item where it is. A blur with no
                  // relatedTarget can come from React moving the node during a reorder, so ignore it
                  // (the effect above restores focus).
                  if (isHeld && e.relatedTarget) {
                    setHeld(null);
                    onReorder?.(items);
                  }
                }}
                onPointerDown={(e) => onPointerDown(e, item.id)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerCancel}
              >
                <span aria-hidden="true">⠿</span>
              </button>
              <span className="label">{item.label}</span>
            </li>
          );
        })}
      </ul>
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </>
  );
}

export default function App() {
  return (
    <main>
      <h1>Priorities</h1>
      <SortableList initialItems={INITIAL} />
    </main>
  );
}
