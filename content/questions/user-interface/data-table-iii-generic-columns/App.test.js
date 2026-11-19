import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from './App';

const table = (name) => screen.getByRole('table', { name });
const region = (name) => screen.getByRole('region', { name });
const bodyRows = (name) => within(table(name)).getAllByRole('row').slice(1);

describe('Generic DataTable', () => {
  test('renders a Users table and a Houses table from column configs', () => {
    render(<App />);
    expect(within(table('Users')).getByRole('columnheader', { name: /Occupation/ })).toBeTruthy();
    expect(within(table('Houses')).getByRole('columnheader', { name: /Built/ })).toBeTruthy();
    expect(bodyRows('Users')).toHaveLength(5);
    expect(bodyRows('Houses')).toHaveLength(5);
  });

  test('custom cell renderers format the value', () => {
    render(<App />);
    expect(within(table('Houses')).getByText('$485,000')).toBeTruthy();
  });

  test('sorting uses the raw value, not the rendered string', () => {
    render(<App />);
    const price = within(table('Houses')).getByRole('button', { name: /^Price/ });
    fireEvent.click(price);
    expect(price.closest('th').getAttribute('aria-sort')).toBe('ascending');
    expect(bodyRows('Houses')[0].textContent).toMatch(/\$297,500/);
    fireEvent.click(price);
    expect(bodyRows('Houses')[0].textContent).toMatch(/\$1,250,000/);
  });

  test('columns marked sortable: false have no sort button', () => {
    render(<App />);
    expect(within(table('Users')).queryByRole('button', { name: /^ID/ })).toBeNull();
    expect(within(table('Users')).getByRole('columnheader', { name: 'ID' })).toBeTruthy();
  });

  test('range filters keep rows within the bounds', () => {
    render(<App />);
    fireEvent.change(within(region('Users')).getByLabelText('Minimum Age'), { target: { value: '45' } });
    const rows = bodyRows('Users');
    expect(rows).toHaveLength(4);
    expect(rows.map((r) => r.textContent).join(' ')).toMatch(/Gustav Lind/);
  });

  test('text filters are case-insensitive and tables keep separate state', () => {
    render(<App />);
    fireEvent.change(within(region('Houses')).getByLabelText('City contains'), { target: { value: 'austin' } });
    expect(bodyRows('Houses')).toHaveLength(3);
    expect(bodyRows('Users')).toHaveLength(5);
    fireEvent.click(within(table('Houses')).getByRole('button', { name: /^City/ }));
    expect(within(table('Users')).getByRole('button', { name: /^Name/ }).closest('th').getAttribute('aria-sort')).toBeNull();
  });
});
