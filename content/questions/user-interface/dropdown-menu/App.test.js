import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const button = () => screen.getByRole('button', { name: /actions/i });
const item = (name) => screen.getByRole('menuitem', { name });
const key = (k) => fireEvent.keyDown(document.activeElement, { key: k });
const last = () => screen.getByText(/last action/i).textContent;

describe('Dropdown menu (menu button pattern)', () => {
  test('starts closed with the right ARIA on the button', () => {
    render(<App />);
    expect(button().getAttribute('aria-haspopup')).toBe('menu');
    expect(button().getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  test('click opens a labelled menu and focuses the first item', () => {
    render(<App />);
    fireEvent.click(button());
    const menu = screen.getByRole('menu');
    expect(button().getAttribute('aria-expanded')).toBe('true');
    expect(button().getAttribute('aria-controls')).toBe(menu.id);
    expect(menu.getAttribute('aria-labelledby')).toBe(button().id);
    expect(screen.getAllByRole('menuitem')).toHaveLength(4);
    expect(document.activeElement).toBe(item('Edit'));
    fireEvent.click(button());
    expect(screen.queryByRole('menu')).toBeNull();
  });

  test('ArrowUp on the button opens at the last item; arrows wrap; Home/End', () => {
    render(<App />);
    button().focus();
    key('ArrowUp');
    expect(document.activeElement).toBe(item('Delete'));
    key('ArrowDown');
    expect(document.activeElement).toBe(item('Edit'));
    key('ArrowUp');
    expect(document.activeElement).toBe(item('Delete'));
    key('Home');
    expect(document.activeElement).toBe(item('Edit'));
    key('End');
    expect(document.activeElement).toBe(item('Delete'));
  });

  test('Enter on an item selects it, closes and returns focus', () => {
    render(<App />);
    button().focus();
    key('ArrowDown');
    key('ArrowDown');
    expect(document.activeElement).toBe(item('Duplicate'));
    key('Enter');
    expect(last()).toMatch(/duplicate/i);
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(button());
  });

  test('Escape closes and returns focus to the button', () => {
    render(<App />);
    button().focus();
    key('Enter');
    expect(screen.getByRole('menu')).toBeTruthy();
    key('Escape');
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(button());
  });

  test('disabled items are focusable but cannot be activated', () => {
    render(<App />);
    fireEvent.click(button());
    expect(item('Archive').getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(item('Archive'));
    expect(last()).toMatch(/none/i);
    expect(screen.getByRole('menu')).toBeTruthy();
  });

  test('typeahead moves to the next item starting with the typed letter', () => {
    render(<App />);
    fireEvent.click(button());
    key('d');
    expect(document.activeElement).toBe(item('Duplicate'));
    key('d');
    expect(document.activeElement).toBe(item('Delete'));
    key('e');
    expect(document.activeElement).toBe(item('Edit'));
  });

  test('clicking outside closes the menu', () => {
    render(<App />);
    fireEvent.click(button());
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menu')).toBeNull();
  });
});
