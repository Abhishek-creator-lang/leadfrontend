import React, { useRef, useState } from 'react';
import './styles.css';

const INITIAL_TODOS = [
  { id: 1, text: 'Buy milk', done: false },
  { id: 2, text: 'Book dentist appointment', done: true },
  { id: 3, text: 'Prepare interview notes', done: false },
];

const FILTERS = {
  All: () => true,
  Active: (t) => !t.done,
  Completed: (t) => t.done,
};

let nextId = 100;

export default function App() {
  const [todos, setTodos] = useState(INITIAL_TODOS);
  const [text, setText] = useState('');
  const [filter, setFilter] = useState('All');
  const inputRef = useRef(null);
  const headingRef = useRef(null);
  const deleteRefs = useRef(new Map());

  const visible = todos.filter(FILTERS[filter]);
  const remaining = todos.filter((t) => !t.done).length;

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setTodos((prev) => [...prev, { id: nextId++, text: trimmed, done: false }]);
    setText('');
    inputRef.current?.focus();
  }

  const toggle = (id) => setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  function remove(id) {
    // Move focus to the next item's delete button, else the previous one, else the heading.
    const index = visible.findIndex((t) => t.id === id);
    const neighbour = visible[index + 1] ?? visible[index - 1];
    setTodos((prev) => prev.filter((t) => t.id !== id));
    const target = neighbour ? deleteRefs.current.get(neighbour.id) : headingRef.current;
    target?.focus();
  }

  return (
    <main className="todo">
      <h1 ref={headingRef} tabIndex={-1}>
        Tasks
      </h1>
      <form className="todo-form" onSubmit={handleSubmit}>
        <label htmlFor="new-task" className="visually-hidden">
          New task
        </label>
        <input
          id="new-task"
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs doing?"
          autoComplete="off"
        />
        <button type="submit">Add</button>
      </form>

      <div className="filters" role="group" aria-label="Filter tasks">
        {Object.keys(FILTERS).map((name) => (
          <button key={name} type="button" aria-pressed={filter === name} onClick={() => setFilter(name)}>
            {name}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="empty">{filter === 'Completed' ? 'Nothing completed yet.' : 'All clear! Add a task above.'}</p>
      ) : (
        <ul className="todo-list">
          {visible.map((todo) => (
            <li key={todo.id} className={`todo-item${todo.done ? ' todo-item--done' : ''}`}>
              <label>
                <input type="checkbox" checked={todo.done} onChange={() => toggle(todo.id)} />
                <span className="todo-text">{todo.text}</span>
              </label>
              <button
                type="button"
                className="delete-button"
                aria-label={`Delete ${todo.text}`}
                ref={(el) => {
                  if (el) deleteRefs.current.set(todo.id, el);
                  else deleteRefs.current.delete(todo.id);
                }}
                onClick={() => remove(todo.id)}
              >
                <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="todo-footer" role="status">
        {remaining} {remaining === 1 ? 'task' : 'tasks'} left
      </p>
    </main>
  );
}
