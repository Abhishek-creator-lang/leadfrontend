import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const pad = (n) => String(n).padStart(2, '0');
const day = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const trip = () => screen.getByLabelText('Trip type');
const departure = () => screen.getByLabelText('Departure date');
const ret = () => screen.getByLabelText('Return date');
const book = () => screen.getByRole('button', { name: 'Book' });
const set = (el, value) => fireEvent.change(el, { target: { value } });

describe('Flight booker', () => {
  test('defaults to a one-way trip today with return disabled', () => {
    render(<App />);
    expect(trip().value).toBe('one-way');
    expect(departure().value).toBe(day(0));
    expect(ret().disabled).toBe(true);
    expect(book().disabled).toBe(false);
  });

  test('return trips enable the return date', () => {
    render(<App />);
    set(trip(), 'return');
    expect(ret().disabled).toBe(false);
  });

  test('a return date before departure is invalid', () => {
    render(<App />);
    set(trip(), 'return');
    set(departure(), day(10));
    set(ret(), day(5));
    expect(ret().getAttribute('aria-invalid')).toBe('true');
    expect(document.getElementById(ret().getAttribute('aria-describedby'))).toBeTruthy();
    expect(book().disabled).toBe(true);
    set(trip(), 'one-way');
    expect(book().disabled).toBe(false);
  });

  test('a departure date in the past is invalid', () => {
    render(<App />);
    set(departure(), day(-1));
    expect(departure().getAttribute('aria-invalid')).toBe('true');
    expect(book().disabled).toBe(true);
  });

  test('booking shows a confirmation', () => {
    render(<App />);
    set(trip(), 'return');
    set(departure(), day(3));
    set(ret(), day(7));
    fireEvent.click(book());
    expect(screen.getByRole('status').textContent).toBe(
      `You booked a return flight departing ${day(3)} and returning ${day(7)}.`
    );
  });
});
