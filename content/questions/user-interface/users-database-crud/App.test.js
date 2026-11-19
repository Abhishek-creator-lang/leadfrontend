import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const options = () => screen.getAllByRole('option').map((o) => o.textContent);
const option = (name) => screen.getByRole('option', { name });
const btn = (name) => screen.getByRole('button', { name });
const first = () => screen.getByLabelText('First name');
const last = () => screen.getByLabelText('Last name');
const type = (input, value) => fireEvent.change(input, { target: { value } });
const status = () => screen.getByRole('status').textContent;

describe('Users database', () => {
  test('lists users sorted by last name in a listbox', () => {
    render(<App />);
    expect(screen.getByRole('listbox')).toBeTruthy();
    expect(options()).toEqual(['Hopper, Grace', 'Johnson, Katherine', 'Lovelace, Ada', 'Turing, Alan']);
  });

  test('search filters case-insensitively', () => {
    render(<App />);
    type(screen.getByLabelText('Search'), 'AL');
    expect(options()).toEqual(['Turing, Alan']);
    type(screen.getByLabelText('Search'), 'grace hop');
    expect(options()).toEqual(['Hopper, Grace']);
  });

  test('selecting a user fills the form and sets aria-selected', () => {
    render(<App />);
    fireEvent.click(option('Lovelace, Ada'));
    expect(option('Lovelace, Ada').getAttribute('aria-selected')).toBe('true');
    expect(first().value).toBe('Ada');
    expect(last().value).toBe('Lovelace');
    expect(btn('Create').disabled).toBe(true);
    expect(btn('Delete').disabled).toBe(false);
  });

  test('creates a user from trimmed input', () => {
    render(<App />);
    expect(btn('Create').disabled).toBe(true);
    type(first(), '  Margaret ');
    type(last(), '   ');
    expect(btn('Create').disabled).toBe(true);
    type(last(), ' Hamilton ');
    fireEvent.click(btn('Create'));
    expect(options()).toContain('Hamilton, Margaret');
    expect(first().value).toBe('');
    expect(status()).toMatch(/created hamilton, margaret/i);
  });

  test('updates the selected user only when something changed', () => {
    render(<App />);
    fireEvent.click(option('Turing, Alan'));
    expect(btn('Update').disabled).toBe(true);
    type(first(), 'Alan M.');
    fireEvent.click(btn('Update'));
    expect(options()).toContain('Turing, Alan M.');
    expect(options()).not.toContain('Turing, Alan');
    expect(status()).toMatch(/updated/i);
  });

  test('deletes the selected user and moves focus to the list', () => {
    render(<App />);
    fireEvent.click(option('Hopper, Grace'));
    btn('Delete').focus();
    fireEvent.click(btn('Delete'));
    expect(options()).not.toContain('Hopper, Grace');
    expect(first().value).toBe('');
    expect(document.activeElement).toBe(screen.getByRole('listbox'));
    expect(status()).toMatch(/deleted hopper, grace/i);
  });

  test('Cancel clears the selection and form', () => {
    render(<App />);
    fireEvent.click(option('Johnson, Katherine'));
    fireEvent.click(btn('Cancel'));
    expect(screen.queryAllByRole('option', { selected: true })).toHaveLength(0);
    expect(last().value).toBe('');
  });

  test('arrow keys move the selection in the listbox', () => {
    render(<App />);
    const listbox = screen.getByRole('listbox');
    listbox.focus();
    fireEvent.keyDown(listbox, { key: 'ArrowDown' });
    expect(option('Hopper, Grace').getAttribute('aria-selected')).toBe('true');
    expect(listbox.getAttribute('aria-activedescendant')).toBe(option('Hopper, Grace').id);
    fireEvent.keyDown(listbox, { key: 'ArrowDown' });
    expect(first().value).toBe('Katherine');
    fireEvent.keyDown(listbox, { key: 'End' });
    expect(first().value).toBe('Alan');
  });
});
