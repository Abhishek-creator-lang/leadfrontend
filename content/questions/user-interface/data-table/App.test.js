import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// All rows minus the header row.
const bodyRows = () => screen.getAllByRole('row').slice(1);
const next = () => screen.getByRole('button', { name: 'Next page' });
const prev = () => screen.getByRole('button', { name: 'Previous page' });

describe('DataTable with pagination', () => {
  test('shows the first 5 users and the page indicator', () => {
    render(<App />);
    expect(bodyRows()).toHaveLength(5);
    expect(screen.getByText('Amara Okafor')).toBeTruthy();
    expect(screen.queryByText('Farah Haddad')).toBeNull();
    expect(screen.getByText(/Page 1 of 5/)).toBeTruthy();
  });

  test('Previous is disabled on the first page', () => {
    render(<App />);
    expect(prev().disabled).toBe(true);
    expect(next().disabled).toBe(false);
  });

  test('Next and Previous move between pages', () => {
    render(<App />);
    fireEvent.click(next());
    expect(screen.getByText(/Page 2 of 5/)).toBeTruthy();
    expect(screen.getByText('Farah Haddad')).toBeTruthy();
    expect(screen.queryByText('Amara Okafor')).toBeNull();
    fireEvent.click(prev());
    expect(screen.getByText('Amara Okafor')).toBeTruthy();
  });

  test('the last page shows the remaining rows and disables Next', () => {
    render(<App />);
    for (let i = 0; i < 4; i++) fireEvent.click(next());
    expect(screen.getByText(/Page 5 of 5/)).toBeTruthy();
    expect(bodyRows()).toHaveLength(3);
    expect(next().disabled).toBe(true);
  });

  test('changing the page size updates rows and resets to page 1', () => {
    render(<App />);
    fireEvent.click(next());
    fireEvent.change(screen.getByLabelText('Rows per page'), { target: { value: '10' } });
    expect(bodyRows()).toHaveLength(10);
    expect(screen.getByText(/Page 1 of 3/)).toBeTruthy();
    expect(screen.getByText('Amara Okafor')).toBeTruthy();
  });
});
