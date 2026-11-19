import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const cells = () => screen.getAllByRole('gridcell');
const cell = (row, col) => cells()[(row - 1) * 16 + (col - 1)];
const labelOf = (row, col) => cell(row, col).getAttribute('aria-label');

describe('Pixel art editor', () => {
  test('renders a 16x16 grid of empty, named cells', () => {
    render(<App />);
    expect(screen.getByRole('grid')).toBeTruthy();
    expect(cells()).toHaveLength(256);
    expect(labelOf(1, 3)).toBe('Row 1, column 3: empty');
  });

  test('mouse down paints with the selected colour (Black by default)', () => {
    render(<App />);
    fireEvent.mouseDown(cell(1, 1));
    fireEvent.mouseUp(window);
    expect(labelOf(1, 1)).toBe('Row 1, column 1: Black');
    fireEvent.click(screen.getByRole('radio', { name: 'Red' }));
    fireEvent.mouseDown(cell(2, 1));
    fireEvent.mouseUp(window);
    expect(labelOf(2, 1)).toBe('Row 2, column 1: Red');
  });

  test('dragging paints every cell passed over until the button is released', () => {
    render(<App />);
    fireEvent.mouseDown(cell(1, 1));
    fireEvent.mouseOver(cell(1, 2));
    fireEvent.mouseOver(cell(2, 2));
    fireEvent.mouseUp(window);
    fireEvent.mouseOver(cell(3, 3));
    expect(labelOf(1, 2)).toBe('Row 1, column 2: Black');
    expect(labelOf(2, 2)).toBe('Row 2, column 2: Black');
    expect(labelOf(3, 3)).toBe('Row 3, column 3: empty');
  });

  test('erase tool empties cells and Clear empties the canvas', () => {
    render(<App />);
    fireEvent.mouseDown(cell(1, 1));
    fireEvent.mouseOver(cell(1, 2));
    fireEvent.mouseUp(window);
    fireEvent.click(screen.getByRole('radio', { name: 'Erase' }));
    fireEvent.mouseDown(cell(1, 1));
    fireEvent.mouseUp(window);
    expect(labelOf(1, 1)).toBe('Row 1, column 1: empty');
    expect(labelOf(1, 2)).toBe('Row 1, column 2: Black');
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(labelOf(1, 2)).toBe('Row 1, column 2: empty');
  });

  test('keyboard: one tab stop, arrows move, Space paints', () => {
    render(<App />);
    const tabbable = cells().filter((c) => c.getAttribute('tabindex') === '0');
    expect(tabbable).toHaveLength(1);
    cell(1, 1).focus();
    fireEvent.keyDown(document.activeElement, { key: 'ArrowRight' });
    fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(cell(2, 2));
    expect(cell(2, 2).getAttribute('tabindex')).toBe('0');
    fireEvent.click(screen.getByRole('radio', { name: 'Blue' }));
    cell(2, 2).focus();
    fireEvent.keyDown(document.activeElement, { key: ' ' });
    expect(labelOf(2, 2)).toBe('Row 2, column 2: Blue');
  });
});
