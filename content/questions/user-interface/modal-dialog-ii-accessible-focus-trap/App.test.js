import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const btn = (name) => screen.getByRole('button', { name });
const open = () => {
  const trigger = btn('Edit profile');
  trigger.focus();
  fireEvent.click(trigger);
  return screen.getByRole('dialog', { name: 'Edit profile' });
};
const tab = (shiftKey = false) => fireEvent.keyDown(document.activeElement, { key: 'Tab', shiftKey });

describe('Accessible modal with focus trap', () => {
  test('initial focus goes to the Name field', () => {
    render(<App />);
    open();
    expect(document.activeElement).toBe(screen.getByLabelText('Name'));
  });

  test('Tab on the last element wraps to the first', () => {
    render(<App />);
    open();
    btn('Save').focus();
    tab();
    expect(document.activeElement).toBe(btn('Close'));
  });

  test('Shift+Tab on the first element wraps to the last', () => {
    render(<App />);
    open();
    btn('Close').focus();
    tab(true);
    expect(document.activeElement).toBe(btn('Save'));
  });

  test('focus that escapes the dialog is pulled back in', () => {
    render(<App />);
    const dialog = open();
    const link = document.querySelector('a[href="#help"]');
    link.focus();
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  test('background is inert while open and restored after closing', () => {
    const { container } = render(<App />);
    const dialog = open();
    expect(container.hasAttribute('inert')).toBe(true);
    expect(dialog.closest('[inert]')).toBeNull();
    fireEvent.keyDown(document.activeElement, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(container.hasAttribute('inert')).toBe(false);
    expect(document.activeElement).toBe(btn('Edit profile'));
  });

  test('saving updates the profile', () => {
    render(<App />);
    open();
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada Lovelace' } });
    fireEvent.click(btn('Save'));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByText(/Ada Lovelace · grace@example\.com/)).toBeTruthy();
  });
});
