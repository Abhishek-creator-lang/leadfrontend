import React from 'react';
import './styles.css';

const INITIAL_TODOS = [
  { id: 1, text: 'Buy milk', done: false },
  { id: 2, text: 'Book dentist appointment', done: true },
  { id: 3, text: 'Prepare interview notes', done: false },
];

export default function App() {
  // TODO: state for todos, the input value and the filter.
  const todos = INITIAL_TODOS;

  return (
    <main className="todo">
      <h1>Tasks</h1>
      {/* TODO: submit adds a task */}
      <form className="todo-form">
        <label htmlFor="new-task" className="visually-hidden">
          New task
        </label>
        <input id="new-task" placeholder="What needs doing?" />
        <button type="submit">Add</button>
      </form>

      <div className="filters">
        <button type="button">All</button>
        <button type="button">Active</button>
        <button type="button">Completed</button>
      </div>

      <ul className="todo-list">
        {todos.map((todo, index) => (
          <li key={index} className="todo-item">
            <input type="checkbox" checked={todo.done} readOnly />
            <span>{todo.text}</span>
            <button type="button">×</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
