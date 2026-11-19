import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';

const wait = (ms) => act(() => new Promise((r) => setTimeout(r, ms)));
const values = () => screen.getAllByRole('progressbar').map((el) => Number(el.getAttribute('aria-valuenow')));

describe('Progress bars with a concurrency limit', () => {
  test('only three bars fill at once; the rest stay queued at 0', async () => {
    render(<App />);
    const add = screen.getByRole('button', { name: 'Add' });
    for (let i = 0; i < 5; i++) fireEvent.click(add);
    expect(screen.getAllByRole('progressbar')).toHaveLength(5);
    await wait(400);
    const v = values();
    expect(v[0] > 0 && v[1] > 0 && v[2] > 0).toBe(true);
    expect(v[3]).toBe(0);
    expect(v[4]).toBe(0);
  });

  test('summary line counts running and queued bars', () => {
    render(<App />);
    const add = screen.getByRole('button', { name: 'Add' });
    for (let i = 0; i < 4; i++) fireEvent.click(add);
    expect(screen.getByText(/3 running · 1 queued · 0 done/)).toBeTruthy();
  });

  test('queued bars report "Queued" as their value text', () => {
    render(<App />);
    const add = screen.getByRole('button', { name: 'Add' });
    for (let i = 0; i < 4; i++) fireEvent.click(add);
    const queued = screen.getByRole('progressbar', { name: 'Download 4' });
    expect(queued.getAttribute('aria-valuetext')).toBe('Queued');
  });

  test('clear removes everything', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.queryAllByRole('progressbar')).toHaveLength(0);
  });
});
