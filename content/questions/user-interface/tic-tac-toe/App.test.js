import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const cell = (r, c) => screen.getByRole('button', { name: new RegExp(`^Row ${r}, column ${c},`, 'i') });
const status = () => screen.getByRole('status').textContent;
const play = (moves) => moves.forEach(([r, c]) => fireEvent.click(cell(r, c)));

describe('Tic-tac-toe', () => {
  test('starts with nine empty cells and X to move', () => {
    render(<App />);
    expect(screen.getAllByRole('button', { name: /^Row \d, column \d, empty$/i })).toHaveLength(9);
    expect(status()).toMatch(/next player: x/i);
  });

  test('players alternate and filled cells cannot be overwritten', () => {
    render(<App />);
    fireEvent.click(cell(1, 1));
    expect(cell(1, 1).textContent).toBe('X');
    expect(status()).toMatch(/next player: o/i);
    fireEvent.click(cell(1, 1));
    expect(cell(1, 1).textContent).toBe('X');
    expect(status()).toMatch(/next player: o/i);
    fireEvent.click(cell(2, 2));
    expect(cell(2, 2).textContent).toBe('O');
    expect(cell(2, 2).getAttribute('aria-label')).toMatch(/row 2, column 2, o$/i);
  });

  test('detects a row win and stops the game', () => {
    render(<App />);
    play([[1, 1], [2, 1], [1, 2], [2, 2], [1, 3]]);
    expect(status()).toMatch(/player x wins/i);
    fireEvent.click(cell(3, 3));
    expect(cell(3, 3).textContent).toBe('');
  });

  test('detects a diagonal win for O', () => {
    render(<App />);
    play([[1, 2], [1, 3], [1, 1], [2, 2], [3, 3], [3, 1]]);
    expect(status()).toMatch(/player o wins/i);
  });

  test('detects a draw', () => {
    render(<App />);
    play([[1, 1], [1, 2], [1, 3], [2, 2], [2, 1], [2, 3], [3, 2], [3, 1], [3, 3]]);
    expect(status()).toMatch(/draw/i);
  });

  test('New game clears the board', () => {
    render(<App />);
    play([[1, 1], [2, 2]]);
    fireEvent.click(screen.getByRole('button', { name: /new game/i }));
    expect(screen.getAllByRole('button', { name: /empty$/i })).toHaveLength(9);
    expect(status()).toMatch(/next player: x/i);
  });

  test('board is one tab stop and arrow keys move focus', () => {
    render(<App />);
    expect(cell(1, 1).tabIndex).toBe(0);
    expect(cell(1, 2).tabIndex).toBe(-1);
    cell(1, 1).focus();
    fireEvent.keyDown(document.activeElement, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(cell(1, 2));
    fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(cell(2, 2));
    fireEvent.keyDown(document.activeElement, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(cell(2, 1));
    fireEvent.keyDown(document.activeElement, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(cell(1, 1));
    fireEvent.keyDown(document.activeElement, { key: 'End' });
    expect(document.activeElement).toBe(cell(1, 3));
    expect(cell(1, 3).tabIndex).toBe(0);
    expect(cell(1, 1).tabIndex).toBe(-1);
  });
});
