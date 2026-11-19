import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';

const wait = (ms) => act(() => new Promise((r) => setTimeout(r, ms)));
const bold = () => screen.getByRole('button', { name: 'Bold' });
const settings = () => screen.getByRole('button', { name: 'Settings' });

describe('Tooltip', () => {
  test('appears on focus and describes the trigger', () => {
    render(<App />);
    expect(screen.queryByRole('tooltip')).toBeNull();
    act(() => bold().focus());
    const tip = screen.getByRole('tooltip');
    expect(tip.textContent).toBe('Bold (Ctrl+B)');
    expect(bold().getAttribute('aria-describedby')).toBe(tip.id);
  });

  test('hides on Escape without moving focus, and on blur', () => {
    render(<App />);
    act(() => bold().focus());
    fireEvent.keyDown(document.activeElement, { key: 'Escape' });
    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(document.activeElement).toBe(bold());
    act(() => bold().blur());
    act(() => bold().focus());
    expect(screen.getByRole('tooltip')).toBeTruthy();
    act(() => bold().blur());
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  test('hover shows after a delay and stays open over the tooltip', async () => {
    render(<App />);
    const wrapper = bold().parentElement;
    fireEvent.mouseEnter(wrapper);
    expect(screen.queryByRole('tooltip')).toBeNull();
    await wait(400);
    expect(screen.getByRole('tooltip')).toBeTruthy();
    fireEvent.mouseLeave(wrapper);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});

describe('Popover', () => {
  test('toggles a labelled dialog and moves focus inside', () => {
    render(<App />);
    expect(settings().getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(settings());
    expect(settings().getAttribute('aria-expanded')).toBe('true');
    const dialog = screen.getByRole('dialog', { name: 'Text settings' });
    expect(settings().getAttribute('aria-controls')).toBe(dialog.id);
    expect(document.activeElement).toBe(screen.getByRole('checkbox', { name: 'Spell check' }));
  });

  test('Escape closes and returns focus to the trigger', () => {
    render(<App />);
    fireEvent.click(settings());
    fireEvent.keyDown(document.activeElement, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(settings());
  });

  test('outside clicks close it, clicks inside do not', () => {
    render(<App />);
    fireEvent.click(settings());
    fireEvent.mouseDown(screen.getByRole('checkbox', { name: 'Smart quotes' }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.mouseDown(screen.getByText(/Click outside/));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
