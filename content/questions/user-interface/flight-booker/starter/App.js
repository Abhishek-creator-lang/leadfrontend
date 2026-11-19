import React from 'react';
import './styles.css';

// TODO: trip type state, default dates to today, disable return for one-way,
// validate dates, disable Book when invalid, show a confirmation.
export default function App() {
  return (
    <main className="booker">
      <h1>Book a flight</h1>
      <form className="form">
        <div className="field">
          <label htmlFor="trip">Trip type</label>
          <select id="trip">
            <option value="one-way">One-way flight</option>
            <option value="return">Return flight</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="departure">Departure date</label>
          <input id="departure" type="date" />
        </div>
        <div className="field">
          <label htmlFor="return">Return date</label>
          <input id="return" type="date" />
        </div>
        <button type="submit">Book</button>
      </form>
    </main>
  );
}
