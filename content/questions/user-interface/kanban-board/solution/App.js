import React, { useEffect, useId, useReducer, useRef, useState } from 'react';
import { INITIAL_BOARD, boardReducer, locate } from './boardReducer';
import './styles.css';

function AddCard({ column, onAdd }) {
  const [title, setTitle] = useState('');
  const inputId = useId();
  return (
    <form
      className="add-card"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        onAdd(title);
        setTitle('');
      }}
    >
      <label htmlFor={inputId} className="sr-only">
        New card in {column.title}
      </label>
      <input id={inputId} value={title} placeholder="Add a card…" onChange={(e) => setTitle(e.target.value)} />
      <button type="submit">
        Add<span className="sr-only"> to {column.title}</span>
      </button>
    </form>
  );
}

export default function App() {
  const [board, dispatch] = useReducer(boardReducer, INITIAL_BOARD);
  const [held, setHeld] = useState(null); // keyboard: { cardId, snapshot }
  const [dragId, setDragId] = useState(null); // pointer drag
  const [overColumn, setOverColumn] = useState(null);
  const [announcement, setAnnouncement] = useState('');
  const handleRefs = useRef(new Map());
  const cardRefs = useRef(new Map());
  const columnRefs = useRef(new Map());
  const refocus = useRef(null);
  const instructionsId = useId();

  // Moving a card re-parents its DOM node (different column list), which drops focus.
  useEffect(() => {
    if (refocus.current) {
      handleRefs.current.get(refocus.current)?.focus();
      refocus.current = null;
    }
  }, [board]);

  const title = (id) => board.cardsById[id]?.title ?? '';

  function describe(b, cardId) {
    const pos = locate(b, cardId);
    const column = b.columns[pos.columnIndex];
    return `${column.title}, position ${pos.index + 1} of ${column.cardIds.length}`;
  }

  function moveTo(cardId, toColumnIndex, toIndex) {
    const action = { type: 'move', cardId, toColumnIndex, toIndex };
    const next = boardReducer(board, action); // same pure reducer, so we can announce the result
    if (next === board) return;
    refocus.current = cardId;
    dispatch(action);
    setAnnouncement(`${title(cardId)} moved to ${describe(next, cardId)}.`);
  }

  // ---------- Keyboard ----------
  function onHandleKeyDown(event, cardId) {
    const isHeld = held?.cardId === cardId;
    const pos = locate(board, cardId);

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (isHeld) {
        setHeld(null);
        setAnnouncement(`Dropped ${title(cardId)} in ${describe(board, cardId)}.`);
      } else {
        setHeld({ cardId, snapshot: board });
        setAnnouncement(`Picked up ${title(cardId)} in ${describe(board, cardId)}.`);
      }
      return;
    }
    if (!isHeld) return;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        if (pos.index > 0) moveTo(cardId, pos.columnIndex, pos.index - 1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (pos.index < board.columns[pos.columnIndex].cardIds.length - 1) {
          moveTo(cardId, pos.columnIndex, pos.index + 1);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        moveTo(cardId, pos.columnIndex - 1, pos.index);
        break;
      case 'ArrowRight':
        event.preventDefault();
        moveTo(cardId, pos.columnIndex + 1, pos.index);
        break;
      case 'Escape': {
        event.preventDefault();
        refocus.current = cardId;
        dispatch({ type: 'restore', board: held.snapshot });
        setHeld(null);
        setAnnouncement(`Move cancelled. ${title(cardId)} returned to ${describe(held.snapshot, cardId)}.`);
        break;
      }
      default:
    }
  }

  // ---------- Pointer ----------
  function onPointerDown(event, cardId) {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDragId(cardId);
  }

  function onPointerMove(event) {
    if (!dragId) return;
    const { clientX, clientY } = event;
    const columnIndex = board.columns.findIndex((col) => {
      const rect = columnRefs.current.get(col.id)?.getBoundingClientRect();
      return rect && clientX >= rect.left && clientX <= rect.right;
    });
    if (columnIndex === -1) return;
    const column = board.columns[columnIndex];
    setOverColumn(column.id);
    let index = 0;
    column.cardIds.forEach((id) => {
      if (id === dragId) return;
      const rect = cardRefs.current.get(id)?.getBoundingClientRect();
      if (rect && clientY > rect.top + rect.height / 2) index += 1;
    });
    const pos = locate(board, dragId);
    if (pos.columnIndex !== columnIndex || pos.index !== index) {
      dispatch({ type: 'move', cardId: dragId, toColumnIndex: columnIndex, toIndex: index });
    }
  }

  function endDrag(event) {
    if (!dragId) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setAnnouncement(`Dropped ${title(dragId)} in ${describe(board, dragId)}.`);
    setDragId(null);
    setOverColumn(null);
  }

  return (
    <main>
      <h1>Sprint board</h1>
      <p id={instructionsId} className="sr-only">
        Press Space or Enter to pick up a card. Use the arrow keys to move it within or between columns, Space or Enter
        to drop, and Escape to cancel.
      </p>
      <div className="board">
        {board.columns.map((column) => {
          const headingId = `${instructionsId}-${column.id}`;
          return (
            <section
              key={column.id}
              ref={(el) => (el ? columnRefs.current.set(column.id, el) : columnRefs.current.delete(column.id))}
              className={`column${overColumn === column.id ? ' column--over' : ''}`}
              aria-labelledby={headingId}
            >
              <h2 id={headingId}>
                {column.title} <span className="count">{column.cardIds.length}</span>
              </h2>
              <ul className="cards">
                {column.cardIds.map((id) => {
                  const card = board.cardsById[id];
                  const lifted = held?.cardId === id || dragId === id;
                  return (
                    <li
                      key={id}
                      ref={(el) => (el ? cardRefs.current.set(id, el) : cardRefs.current.delete(id))}
                      className={`card${lifted ? ' card--lifted' : ''}`}
                    >
                      <button
                        ref={(el) => (el ? handleRefs.current.set(id, el) : handleRefs.current.delete(id))}
                        type="button"
                        className="handle"
                        aria-label={`Move ${card.title}`}
                        aria-describedby={instructionsId}
                        aria-pressed={held?.cardId === id}
                        onKeyDown={(e) => onHandleKeyDown(e, id)}
                        onBlur={(e) => {
                          if (held?.cardId === id && e.relatedTarget) setHeld(null);
                        }}
                        onPointerDown={(e) => onPointerDown(e, id)}
                        onPointerMove={onPointerMove}
                        onPointerUp={endDrag}
                        onPointerCancel={endDrag}
                      >
                        <span aria-hidden="true">⠿</span>
                      </button>
                      <span className="card-title">{card.title}</span>
                      <button
                        type="button"
                        className="delete"
                        aria-label={`Delete ${card.title}`}
                        onClick={() => {
                          dispatch({ type: 'delete', cardId: id });
                          setAnnouncement(`Deleted ${card.title}.`);
                        }}
                      >
                        <span aria-hidden="true">×</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <AddCard
                column={column}
                onAdd={(text) => {
                  dispatch({ type: 'add', columnId: column.id, title: text });
                  setAnnouncement(`Added ${text.trim()} to ${column.title}.`);
                }}
              />
            </section>
          );
        })}
      </div>
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </main>
  );
}
