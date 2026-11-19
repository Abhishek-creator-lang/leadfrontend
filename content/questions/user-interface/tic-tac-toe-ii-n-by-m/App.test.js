import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const cell = (r, c) => screen.getByRole('button', { name: new RegExp(`^Row ${r}, column ${c},`, 'i') });
const cells = () => screen.getAllByRole('button', { name: /^Row \d+, column \d+,/i });
const status = () => screen.getByRole('status').textContent;
const sizeSelect = () => screen.getByLabelText(/board size/i);
const winSelect = () => screen.getByLabelText(/in a row to win/i);
const setSize = (n) => fireEvent.change(sizeSelect(), { target: { value: String(n) } });
const setWin = (m) => fireEvent.change(winSelect(), { target: { value: String(m) } });
const play = (moves) => moves.forEach(([r, c]) => fireEvent.click(cell(r, c)));
const optionValues = (select) => Array.from(select.querySelectorAll('option')).map((o) => o.value);

describe('Tic-tac-toe N x N, M in a row', () => {
  test('defaults to 3 x 3 with 3 in a row', () => {
    render(<App />);
    expect(cells()).toHaveLength(9);
    expect(optionValues(winSelect())).toEqual(['3']);
    expect(status()).toMatch(/next player: x/i);
  });

  test('changing the board size rebuilds the board and win options', () => {
    render(<App />);
    fireEvent.click(cell(1, 1));
    setSize(5);
    expect(cells()).toHaveLength(25);
    expect(screen.getAllByRole('button', { name: /empty$/i })).toHaveLength(25);
    expect(optionValues(winSelect())).toEqual(['3', '4', '5']);
  });

  test('win length is clamped when the board shrinks', () => {
    render(<App />);
    setSize(5);
    setWin(5);
    expect(winSelect().value).toBe('5');
    setSize(4);
    expect(winSelect().value).toBe('4');
    setSize(3);
    expect(winSelect().value).toBe('3');
  });

  test('3 in a row wins on a 4 x 4 board (diagonal)', () => {
    render(<App />);
    setSize(4);
    play([[2, 2], [1, 1], [3, 3], [1, 2], [4, 4]]);
    expect(status()).toMatch(/player x wins/i);
    fireEvent.click(cell(4, 1));
    expect(cell(4, 1).textContent).toBe('');
  });

  test('with M = 4, three in a row is not enough', () => {
    render(<App />);
    setSize(4);
    setWin(4);
    play([[1, 1], [2, 1], [1, 2], [2, 2], [1, 3]]);
    expect(status()).toMatch(/next player: o/i);
    play([[2, 3], [1, 4]]);
    expect(status()).toMatch(/player x wins/i);
  });

  test('filling a gap completes a line in both directions', () => {
    render(<App />);
    setSize(5);
    setWin(4);
    play([[1, 1], [2, 1], [1, 2], [2, 2], [1, 4], [3, 3]]);
    expect(status()).toMatch(/next player: x/i);
    fireEvent.click(cell(1, 3));
    expect(status()).toMatch(/player x wins/i);
  });

  test('arrow keys and Ctrl+End move focus across the grid', () => {
    render(<App />);
    setSize(4);
    cell(1, 1).focus();
    fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(cell(2, 1));
    fireEvent.keyDown(document.activeElement, { key: 'End', ctrlKey: true });
    expect(document.activeElement).toBe(cell(4, 4));
    expect(cell(4, 4).tabIndex).toBe(0);
    expect(cell(1, 1).tabIndex).toBe(-1);
  });
});
