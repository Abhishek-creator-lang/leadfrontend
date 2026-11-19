import React from 'react';
import './styles.css';

// TODO: on submit, validate and build a rows × columns grid in the selected fill order, then render it.
export default function App() {
  return (
    <main className="generator">
      <h1>Table generator</h1>
      <form className="form">
        <div className="field">
          <label htmlFor="rows">Rows</label>
          <input id="rows" name="rows" inputMode="numeric" defaultValue="4" />
        </div>
        <div className="field">
          <label htmlFor="columns">Columns</label>
          <input id="columns" name="columns" inputMode="numeric" defaultValue="5" />
        </div>
        <div className="field">
          <label htmlFor="order">Fill order</label>
          <select id="order" name="order" defaultValue="row">
            <option value="row">Row by row</option>
            <option value="column">Column by column</option>
            <option value="snake">Snake (columns)</option>
          </select>
        </div>
        <button type="submit">Generate</button>
      </form>
    </main>
  );
}
