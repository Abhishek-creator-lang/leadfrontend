import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const bodyRows = () => screen.getAllByRole('row').slice(1);
const firstRowText = () => bodyRows()[0].textContent;
const header = (label) => screen.getByRole('button', { name: new RegExp(`^${label}`) });
const search = (value) => fireEvent.change(screen.getByLabelText('Search users'), { target: { value } });

describe('DataTable with sorting and filtering', () => {
  test('clicking a header sorts ascending, then descending', () => {
    render(<App />);
    fireEvent.click(header('Age'));
    expect(header('Age').closest('th').getAttribute('aria-sort')).toBe('ascending');
    expect(firstRowText()).toMatch(/Hana Sato/);
    fireEvent.click(header('Age'));
    expect(header('Age').closest('th').getAttribute('aria-sort')).toBe('descending');
    expect(firstRowText()).toMatch(/Gustav Lind/);
  });

  test('only the sorted column has aria-sort', () => {
    render(<App />);
    fireEvent.click(header('Age'));
    fireEvent.click(header('Name'));
    expect(header('Name').closest('th').getAttribute('aria-sort')).toBe('ascending');
    expect(header('Age').closest('th').getAttribute('aria-sort')).toBeNull();
    fireEvent.click(header('Name'));
    expect(firstRowText()).toMatch(/Yusuf Kaya/);
  });

  test('search filters by occupation, case-insensitively', () => {
    render(<App />);
    search('ENGINEER');
    expect(screen.getByText(/Page 1 of 3/)).toBeTruthy();
    expect(screen.getByText('13 results')).toBeTruthy();
    expect(screen.queryByText('Amara Okafor')).toBeNull();
  });

  test('search filters by name', () => {
    render(<App />);
    search('rossi');
    expect(bodyRows()).toHaveLength(1);
    expect(firstRowText()).toMatch(/Julia Rossi/);
  });

  test('shows a message when nothing matches', () => {
    render(<App />);
    search('zzzz');
    expect(screen.getByText(/No users match/)).toBeTruthy();
  });

  test('filtering and sorting reset to page 1', () => {
    render(<App />);
    const next = screen.getByRole('button', { name: 'Next page' });
    fireEvent.click(next);
    fireEvent.click(next);
    expect(screen.getByText(/Page 3 of 5/)).toBeTruthy();
    fireEvent.click(header('Age'));
    expect(screen.getByText(/Page 1 of 5/)).toBeTruthy();
    fireEvent.click(next);
    search('e');
    expect(screen.getByText(/Page 1 of/)).toBeTruthy();
  });
});
