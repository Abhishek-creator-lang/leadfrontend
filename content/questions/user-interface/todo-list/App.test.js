import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const input = () => screen.getByRole('textbox', { name: 'New task' });
const addTask = (text) => {
  fireEvent.change(input(), { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: 'Add' }));
};

describe('Todo list', () => {
  test('adds trimmed tasks, clears the input and ignores blanks', () => {
    render(<App />);
    addTask('   Water plants  ');
    expect(screen.getByRole('checkbox', { name: 'Water plants' })).toBeTruthy();
    expect(input().value).toBe('');
    expect(document.activeElement).toBe(input());
    const before = screen.getAllByRole('checkbox').length;
    addTask('    ');
    expect(screen.getAllByRole('checkbox')).toHaveLength(before);
  });

  test('toggles completion and updates the count', () => {
    render(<App />);
    expect(screen.getByText('2 tasks left')).toBeTruthy();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Buy milk' }));
    expect(screen.getByRole('checkbox', { name: 'Buy milk' }).checked).toBe(true);
    expect(screen.getByText('1 task left')).toBeTruthy();
  });

  test('deletes a task and keeps focus on the list', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete Buy milk' }));
    expect(screen.queryByRole('checkbox', { name: 'Buy milk' })).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Delete Book dentist appointment' }));
  });

  test('filters with aria-pressed', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Completed' }));
    expect(screen.getByRole('button', { name: 'Completed' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Active' }));
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
  });
});
