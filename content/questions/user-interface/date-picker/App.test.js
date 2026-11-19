import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DatePicker } from './App';

const TODAY = new Date(2026, 2, 10); // Tuesday, March 10, 2026

function Harness({ initial = '2026-03-15' }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <DatePicker value={value} onChange={setValue} label="Meeting date" today={TODAY} />
      <output data-testid="value">{value}</output>
    </>
  );
}

const openButton = () => screen.getByRole('button', { name: /^choose date/i });
const day = (name) => screen.getByRole('gridcell', { name: new RegExp(name) });
const key = (k, extra = {}) => fireEvent.keyDown(document.activeElement, { key: k, ...extra });
const value = () => screen.getByTestId('value').textContent;

describe('DatePicker', () => {
  test('button names the selected date; dialog opens on the selected day', () => {
    render(<Harness />);
    expect(openButton().getAttribute('aria-label')).toBe('Choose date, selected date is Sunday, March 15, 2026');
    fireEvent.click(openButton());
    const dialog = screen.getByRole('dialog', { name: 'March 2026' });
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(document.activeElement).toBe(day('March 15, 2026'));
    expect(day('March 15, 2026').getAttribute('aria-selected')).toBe('true');
    expect(day('March 10, 2026').getAttribute('aria-current')).toBe('date');
    expect(day('March 15, 2026').tabIndex).toBe(0);
    expect(day('March 16, 2026').tabIndex).toBe(-1);
  });

  test('opens on today when there is no value', () => {
    render(<Harness initial="" />);
    fireEvent.click(openButton());
    expect(document.activeElement).toBe(day('March 10, 2026'));
  });

  test('arrow keys, Home and End move by day and week', () => {
    render(<Harness />);
    fireEvent.click(openButton());
    key('ArrowRight');
    expect(document.activeElement).toBe(day('Monday, March 16, 2026'));
    key('ArrowDown');
    expect(document.activeElement).toBe(day('March 23, 2026'));
    key('Home');
    expect(document.activeElement).toBe(day('Sunday, March 22, 2026'));
    key('End');
    expect(document.activeElement).toBe(day('Saturday, March 28, 2026'));
    key('ArrowUp');
    expect(document.activeElement).toBe(day('March 21, 2026'));
  });

  test('Page Up / Down change month (clamped) and Shift changes year', () => {
    render(<Harness initial="2026-01-31" />);
    fireEvent.click(openButton());
    key('PageDown');
    expect(screen.getByRole('dialog', { name: 'February 2026' })).toBeTruthy();
    expect(document.activeElement).toBe(day('February 28, 2026'));
    key('PageDown', { shiftKey: true });
    expect(document.activeElement).toBe(day('February 28, 2027'));
    key('PageUp');
    expect(document.activeElement).toBe(day('January 28, 2027'));
  });

  test('Enter selects, closes and returns focus to the button', () => {
    render(<Harness />);
    fireEvent.click(openButton());
    key('ArrowLeft');
    key('Enter');
    expect(value()).toBe('2026-03-14');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(openButton());
    expect(screen.getByLabelText('Meeting date').value).toBe('2026-03-14');
  });

  test('Escape and Cancel close without changing the value', () => {
    render(<Harness />);
    fireEvent.click(openButton());
    key('ArrowRight');
    key('Escape');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(value()).toBe('2026-03-15');
    expect(document.activeElement).toBe(openButton());
    fireEvent.click(openButton());
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  test('month buttons change the month; clicking a day selects it', () => {
    render(<Harness />);
    fireEvent.click(openButton());
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByRole('dialog', { name: 'April 2026' })).toBeTruthy();
    fireEvent.click(day('April 2, 2026'));
    expect(value()).toBe('2026-04-02');
  });

  test('typed input is validated, including impossible dates', () => {
    render(<Harness />);
    const input = screen.getByLabelText('Meeting date');
    fireEvent.change(input, { target: { value: '2026-02-30' } });
    fireEvent.blur(input);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText(/enter a date as yyyy-mm-dd/i)).toBeTruthy();
    expect(value()).toBe('2026-03-15');
    fireEvent.change(input, { target: { value: '2026-07-04' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(value()).toBe('2026-07-04');
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });
});
