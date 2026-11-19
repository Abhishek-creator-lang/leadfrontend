import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from './App';

const btn = (name) => screen.getByRole('button', { name });
const listLabels = (name) => {
  const list = screen.queryByRole('list', { name });
  return list ? within(list).getAllByRole('listitem').map((li) => li.textContent.trim()) : [];
};

describe('TransferList', () => {
  test('buttons are named and disabled when they would do nothing', () => {
    render(<App />);
    expect(btn('Move all to Selected').disabled).toBe(false);
    expect(btn('Move checked to Selected').disabled).toBe(true);
    expect(btn('Move checked to Available').disabled).toBe(true);
    expect(btn('Move all to Available').disabled).toBe(true);
  });

  test('moves checked items, appending them unchecked and in order', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Team' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Email' }));
    expect(btn('Move checked to Selected').disabled).toBe(false);
    fireEvent.click(btn('Move checked to Selected'));
    expect(listLabels('Selected')).toEqual(['Email', 'Team']);
    expect(listLabels('Available')).toEqual(['Name', 'Role', 'Location', 'Joined']);
    expect(screen.getByRole('checkbox', { name: 'Email' }).checked).toBe(false);

    fireEvent.click(screen.getByRole('checkbox', { name: 'Team' }));
    fireEvent.click(btn('Move checked to Available'));
    expect(listLabels('Available')).toEqual(['Name', 'Role', 'Location', 'Joined', 'Team']);
  });

  test('move all buttons transfer everything', () => {
    render(<App />);
    fireEvent.click(btn('Move all to Selected'));
    expect(listLabels('Selected')).toHaveLength(6);
    expect(listLabels('Available')).toHaveLength(0);
    expect(screen.getAllByText('No items')).toHaveLength(1);
    expect(btn('Move all to Selected').disabled).toBe(true);
    fireEvent.click(btn('Move all to Available'));
    expect(listLabels('Available')).toHaveLength(6);
  });

  test('select-all header checkbox is checked, indeterminate or clear', () => {
    render(<App />);
    const selectAll = screen.getByRole('checkbox', { name: 'Select all available' });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Name' }));
    expect(selectAll.indeterminate).toBe(true);
    expect(screen.getByText('1/6 selected')).toBeTruthy();
    fireEvent.click(selectAll);
    expect(selectAll.checked).toBe(true);
    expect(screen.getByRole('checkbox', { name: 'Joined' }).checked).toBe(true);
    fireEvent.click(selectAll);
    expect(screen.getByRole('checkbox', { name: 'Joined' }).checked).toBe(false);
    expect(screen.getByRole('checkbox', { name: 'Select all selected' }).disabled).toBe(true);
  });
});
