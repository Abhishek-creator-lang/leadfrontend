import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const column = (n) => screen.getByRole('button', { name: new RegExp(`^(Drop in column ${n}|Column ${n}, full)$`) });
const drop = (...cols) => cols.forEach((c) => fireEvent.click(column(c)));
const cellLabel = (r, c) =>
  screen.getByRole('cell', { name: new RegExp(`^Row ${r}, column ${c},`) }).getAttribute('aria-label');
const status = () => screen.getByRole('status').textContent;

describe('Connect Four', () => {
  test('starts empty with Red to move', () => {
    render(<App />);
    expect(screen.getAllByRole('button', { name: /^Drop in column \d$/ })).toHaveLength(7);
    expect(screen.getAllByRole('cell', { name: /empty$/ })).toHaveLength(42);
    expect(status()).toMatch(/red's turn/i);
  });

  test('discs fall to the lowest empty row and players alternate', () => {
    render(<App />);
    drop(1, 1);
    expect(cellLabel(6, 1)).toMatch(/red$/);
    expect(cellLabel(5, 1)).toMatch(/yellow$/);
    expect(status()).toMatch(/yellow dropped in column 1\. red's turn/i);
  });

  test('vertical win ends the game', () => {
    render(<App />);
    drop(1, 2, 1, 2, 1, 2, 1);
    expect(status()).toMatch(/red wins/i);
    drop(3);
    expect(cellLabel(6, 3)).toMatch(/empty$/);
  });

  test('horizontal win', () => {
    render(<App />);
    drop(1, 1, 2, 2, 3, 3, 4);
    expect(status()).toMatch(/red wins/i);
  });

  test('diagonal win', () => {
    render(<App />);
    drop(1, 2, 2, 3, 3, 4, 3, 4, 4, 1);
    expect(status()).toMatch(/red's turn/i);
    drop(4);
    expect(status()).toMatch(/red wins/i);
  });

  test('a full column refuses more discs', () => {
    render(<App />);
    drop(1, 1, 1, 1, 1, 1);
    expect(column(1).getAttribute('aria-label')).toBe('Column 1, full');
    drop(1);
    expect(status()).toMatch(/red's turn/i);
    expect(screen.getAllByRole('cell', { name: /(red|yellow)$/ })).toHaveLength(6);
  });

  test('column buttons are one tab stop with arrow-key navigation', () => {
    render(<App />);
    expect(column(1).tabIndex).toBe(0);
    expect(column(2).tabIndex).toBe(-1);
    column(1).focus();
    fireEvent.keyDown(document.activeElement, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(column(2));
    fireEvent.keyDown(document.activeElement, { key: 'End' });
    expect(document.activeElement).toBe(column(7));
    fireEvent.keyDown(document.activeElement, { key: 'Home' });
    expect(document.activeElement).toBe(column(1));
  });

  test('New game clears the board', () => {
    render(<App />);
    drop(4, 4);
    fireEvent.click(screen.getByRole('button', { name: /new game/i }));
    expect(screen.getAllByRole('cell', { name: /empty$/ })).toHaveLength(42);
  });
});
