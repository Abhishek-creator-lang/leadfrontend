import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const cell = (row, col) => screen.getByRole('gridcell', { name: `Row ${row}, column ${col}` });
const selectedCount = () =>
  screen.getAllByRole('gridcell').filter((c) => c.getAttribute('aria-selected') === 'true').length;
const status = () => screen.getByRole('status').textContent;

const drag = (from, to, init = {}) => {
  fireEvent.mouseDown(cell(...from), init);
  fireEvent.mouseOver(cell(...to));
  fireEvent.mouseUp(window);
};

describe('Selectable cells', () => {
  test('renders a multi-selectable grid with nothing selected', () => {
    render(<App />);
    expect(screen.getByRole('grid').getAttribute('aria-multiselectable')).toBe('true');
    expect(screen.getAllByRole('gridcell')).toHaveLength(48);
    expect(selectedCount()).toBe(0);
    expect(status()).toBe('0 cells selected');
  });

  test('dragging selects the rectangle between anchor and pointer', () => {
    render(<App />);
    drag([1, 1], [2, 3]);
    expect(selectedCount()).toBe(6);
    expect(cell(2, 3).getAttribute('aria-selected')).toBe('true');
    expect(cell(3, 1).getAttribute('aria-selected')).toBe('false');
    expect(status()).toBe('6 cells selected');
  });

  test('moving back shrinks the rectangle; releasing ends the drag', () => {
    render(<App />);
    fireEvent.mouseDown(cell(2, 2));
    fireEvent.mouseOver(cell(4, 4));
    fireEvent.mouseOver(cell(2, 3));
    expect(selectedCount()).toBe(2);
    fireEvent.mouseUp(window);
    fireEvent.mouseOver(cell(5, 5));
    expect(selectedCount()).toBe(2);
  });

  test('a new drag replaces the selection, Ctrl+drag adds to it', () => {
    render(<App />);
    drag([1, 1], [1, 2]);
    drag([3, 3], [3, 3]);
    expect(selectedCount()).toBe(1);
    expect(cell(1, 1).getAttribute('aria-selected')).toBe('false');
    drag([5, 5], [6, 6], { ctrlKey: true });
    expect(selectedCount()).toBe(5);
    expect(status()).toBe('5 cells selected');
  });

  test('keyboard: arrows move focus, Space toggles, Shift+arrows extend, Escape clears', () => {
    render(<App />);
    cell(1, 1).focus();
    fireEvent.keyDown(document.activeElement, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(cell(1, 2));
    expect(selectedCount()).toBe(0);
    fireEvent.keyDown(document.activeElement, { key: ' ' });
    expect(status()).toBe('1 cell selected');
    fireEvent.keyDown(document.activeElement, { key: 'ArrowDown', shiftKey: true });
    fireEvent.keyDown(document.activeElement, { key: 'ArrowRight', shiftKey: true });
    expect(document.activeElement).toBe(cell(2, 3));
    expect(selectedCount()).toBe(4);
    fireEvent.keyDown(document.activeElement, { key: 'Escape' });
    expect(selectedCount()).toBe(0);
  });

  test('Ctrl+A selects all cells and only one cell is tabbable', () => {
    render(<App />);
    const tabbable = screen.getAllByRole('gridcell').filter((c) => c.getAttribute('tabindex') === '0');
    expect(tabbable).toHaveLength(1);
    cell(1, 1).focus();
    fireEvent.keyDown(document.activeElement, { key: 'a', ctrlKey: true });
    expect(selectedCount()).toBe(48);
  });
});
