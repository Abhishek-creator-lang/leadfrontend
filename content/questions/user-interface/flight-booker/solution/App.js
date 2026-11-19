import React, { useState } from 'react';
import './styles.css';

// "YYYY-MM-DD" in the user's *local* time zone. toISOString() would use UTC and can be off by a day.
export function toDateInputValue(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export default function App() {
  // Computed once on mount; a booking form left open past midnight is an accepted edge case.
  const [today] = useState(() => toDateInputValue(new Date()));
  const [trip, setTrip] = useState('one-way');
  const [departure, setDeparture] = useState(today);
  const [returnDate, setReturnDate] = useState(today);
  const [booked, setBooked] = useState(null);

  const isReturn = trip === 'return';

  // ISO date strings compare correctly as plain strings.
  const errors = {};
  if (!departure) errors.departure = 'Choose a departure date.';
  else if (departure < today) errors.departure = 'The departure date can’t be in the past.';
  if (isReturn) {
    if (!returnDate) errors.returnDate = 'Choose a return date.';
    else if (departure && returnDate < departure) errors.returnDate = 'The return date can’t be before departure.';
  }
  const valid = Object.keys(errors).length === 0;

  function handleSubmit(event) {
    event.preventDefault();
    if (!valid) return;
    setBooked(
      isReturn
        ? `You booked a return flight departing ${departure} and returning ${returnDate}.`
        : `You booked a one-way flight departing ${departure}.`
    );
  }

  const invalidProps = (key) =>
    errors[key] ? { 'aria-invalid': true, 'aria-describedby': `${key}-error` } : {};

  return (
    <main className="booker">
      <h1>Book a flight</h1>
      <form className="form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="trip">Trip type</label>
          <select id="trip" value={trip} onChange={(e) => setTrip(e.target.value)}>
            <option value="one-way">One-way flight</option>
            <option value="return">Return flight</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="departure">Departure date</label>
          <input
            id="departure"
            type="date"
            min={today}
            value={departure}
            onChange={(e) => setDeparture(e.target.value)}
            {...invalidProps('departure')}
          />
          {errors.departure && (
            <p id="departure-error" className="error">
              {errors.departure}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="return">Return date</label>
          <input
            id="return"
            type="date"
            min={departure || today}
            value={returnDate}
            disabled={!isReturn}
            onChange={(e) => setReturnDate(e.target.value)}
            {...invalidProps('returnDate')}
          />
          {errors.returnDate && (
            <p id="returnDate-error" className="error">
              {errors.returnDate}
            </p>
          )}
        </div>

        <button type="submit" disabled={!valid}>
          Book
        </button>
      </form>

      <div role="status">{booked && <p className="confirmation">{booked}</p>}</div>
    </main>
  );
}
