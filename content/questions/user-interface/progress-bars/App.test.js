import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';

const wait = (ms) => act(() => new Promise((r) => setTimeout(r, ms)));
const now = (el) => Number(el.getAttribute('aria-valuenow'));

describe('Progress bars', () => {
  test('starts empty', () => {
    render(<App />);
    expect(screen.queryAllByRole('progressbar')).toHaveLength(0);
    expect(screen.getByText(/no downloads yet/i)).toBeTruthy();
  });

  test('each click on Add appends a labelled bar', () => {
    render(<App />);
    const add = screen.getByRole('button', { name: 'Add' });
    fireEvent.click(add);
    fireEvent.click(add);
    fireEvent.click(add);
    expect(screen.getAllByRole('progressbar')).toHaveLength(3);
    expect(screen.getByRole('progressbar', { name: 'Download 3' })).toBeTruthy();
  });

  test('bars fill over time', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    const bar = screen.getByRole('progressbar', { name: 'Download 1' });
    expect(now(bar)).toBeLessThan(10);
    await wait(400);
    expect(now(bar)).toBeGreaterThan(5);
    expect(now(bar)).toBeLessThan(100);
  });

  test('clear removes every bar', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.queryAllByRole('progressbar')).toHaveLength(0);
  });
});
