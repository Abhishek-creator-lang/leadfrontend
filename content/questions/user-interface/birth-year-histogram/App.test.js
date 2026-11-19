import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const bars = () => screen.getAllByRole('listitem').map((li) => li.textContent);
const hasBar = (text) => bars().some((t) => t.includes(text));

describe('Birth year histogram', () => {
  test('groups years by decade, including empty decades', () => {
    render(<App />);
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    expect(hasBar('1950–1959: 3 people')).toBe(true);
    expect(hasBar('1960–1969: 0 people')).toBe(true);
    expect(hasBar('1980–1989: 6 people')).toBe(true);
  });

  test('changing the bucket size re-buckets the data', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/bucket size/i), { target: { value: '5' } });
    expect(screen.getAllByRole('listitem')).toHaveLength(10);
    expect(hasBar('1985–1989: 4 people')).toBe(true);
    expect(hasBar('1995–1999: 1 person')).toBe(true);
  });

  test('bucket size 1 uses single-year labels', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/bucket size/i), { target: { value: '1' } });
    expect(screen.getAllByRole('listitem')).toHaveLength(1996 - 1952 + 1);
    expect(hasBar('1974: 2 people')).toBe(true);
  });

  test('adding a valid year extends the range', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/add a birth year/i), { target: { value: '2003' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(6);
    expect(hasBar('2000–2009: 1 person')).toBe(true);
  });

  test('an invalid year shows a linked error', () => {
    render(<App />);
    const input = screen.getByLabelText(/add a birth year/i);
    fireEvent.change(input, { target: { value: '1850' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toMatch(/Enter a year between 1900 and/);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(alert.id);
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
  });

  test('the table view shows the same data', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /show as table/i }));
    expect(screen.getByRole('table')).toBeTruthy();
    expect(screen.getAllByRole('row')).toHaveLength(6);
    expect(screen.getByRole('rowheader', { name: '1960–1969' })).toBeTruthy();
  });
});
