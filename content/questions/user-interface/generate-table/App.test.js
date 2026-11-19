import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const set = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const generate = (rows, columns, order) => {
  set('Rows', String(rows));
  set('Columns', String(columns));
  set('Fill order', order);
  fireEvent.click(screen.getByRole('button', { name: 'Generate' }));
};
const grid = () =>
  screen.getAllByRole('row').map((tr) => Array.from(tr.querySelectorAll('td')).map((td) => Number(td.textContent)));

describe('Generate table', () => {
  test('row by row', () => {
    render(<App />);
    generate(2, 3, 'row');
    expect(grid()).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);
  });

  test('column by column', () => {
    render(<App />);
    generate(2, 3, 'column');
    expect(grid()).toEqual([
      [1, 3, 5],
      [2, 4, 6],
    ]);
  });

  test('snake order alternates direction per column', () => {
    render(<App />);
    generate(3, 3, 'snake');
    expect(grid()).toEqual([
      [1, 6, 7],
      [2, 5, 8],
      [3, 4, 9],
    ]);
  });

  test('table has a descriptive caption', () => {
    render(<App />);
    generate(2, 4, 'snake');
    expect(screen.getByRole('table').querySelector('caption').textContent).toMatch(/2 × 4/);
  });

  test('invalid input shows an error and keeps the previous table', () => {
    render(<App />);
    generate(2, 2, 'row');
    generate(0, 2, 'row');
    const rows = screen.getByLabelText('Rows');
    expect(rows.getAttribute('aria-invalid')).toBe('true');
    expect(document.getElementById(rows.getAttribute('aria-describedby'))).toBeTruthy();
    expect(grid()).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });
});
