import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

const WAIT = { timeout: 2000 };
const input = () => screen.getByRole('combobox', { name: 'Country' });
const type = (value) => {
  fireEvent.focus(input());
  fireEvent.change(input(), { target: { value } });
};

describe('Autocomplete', () => {
  test('shows matching options in a listbox after typing', async () => {
    render(<App />);
    expect(input().getAttribute('aria-expanded')).toBe('false');
    type('swe');
    const options = await screen.findAllByRole('option', {}, WAIT);
    expect(options.map((o) => o.textContent)).toEqual(['Sweden']);
    expect(input().getAttribute('aria-expanded')).toBe('true');
    expect(input().getAttribute('aria-controls')).toBe(screen.getByRole('listbox').id);
  });

  test('arrow keys move the active option via aria-activedescendant; Enter selects', async () => {
    render(<App />);
    type('ind');
    await screen.findAllByRole('option', {}, WAIT);
    fireEvent.keyDown(input(), { key: 'ArrowDown' });
    fireEvent.keyDown(input(), { key: 'ArrowDown' });
    const active = document.getElementById(input().getAttribute('aria-activedescendant'));
    expect(active.textContent).toBe('Indonesia');
    expect(active.getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(input(), { key: 'Enter' });
    expect(input().value).toBe('Indonesia');
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.getByText('You picked Indonesia')).toBeTruthy();
  });

  test('Escape closes the popup', async () => {
    render(<App />);
    type('po');
    await screen.findAllByRole('option', {}, WAIT);
    fireEvent.keyDown(input(), { key: 'Escape' });
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(input().getAttribute('aria-expanded')).toBe('false');
  });

  test('clicking an option selects it', async () => {
    render(<App />);
    type('ken');
    const [kenya] = await screen.findAllByRole('option', {}, WAIT);
    fireEvent.click(kenya);
    expect(input().value).toBe('Kenya');
  });

  test('shows an empty state and an error state', async () => {
    render(<App />);
    type('zzzz');
    expect(await screen.findByText('No results', {}, WAIT)).toBeTruthy();
    type('error');
    expect(await screen.findByText(/went wrong/i, {}, WAIT)).toBeTruthy();
  });

  test('only the latest query wins even if an older response is slower', async () => {
    render(<App />);
    type('c'); // slow response
    await new Promise((r) => setTimeout(r, 250)); // debounce fires, request in flight
    type('germ'); // fast response
    await waitFor(() => expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Germany']), WAIT);
    await new Promise((r) => setTimeout(r, 400)); // let the stale request settle
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Germany']);
  });
});
