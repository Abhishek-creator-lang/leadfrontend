import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const trigger = () => screen.getByRole('button', { name: 'Delete file' });
const openDialog = () => {
  trigger().focus();
  fireEvent.click(trigger());
  return screen.getByRole('dialog', { name: 'Delete file?' });
};

describe('Modal dialog', () => {
  test('is closed initially and opens as a labelled modal dialog', () => {
    render(<App />);
    expect(screen.queryByRole('dialog')).toBeNull();
    const dialog = openDialog();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    const description = document.getElementById(dialog.getAttribute('aria-describedby'));
    expect(description.textContent).toMatch(/permanently deleted/);
  });

  test('moves focus to Cancel on open', () => {
    render(<App />);
    openDialog();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cancel' }));
  });

  test('Escape closes and restores focus to the trigger', () => {
    render(<App />);
    openDialog();
    fireEvent.keyDown(document.activeElement, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  test('backdrop click closes, clicks inside do not', () => {
    render(<App />);
    const dialog = openDialog();
    fireEvent.mouseDown(dialog);
    fireEvent.click(dialog);
    expect(screen.queryByRole('dialog')).toBeTruthy();
    const backdrop = dialog.parentElement;
    fireEvent.mouseDown(backdrop);
    fireEvent.click(backdrop);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  test('close button and actions work', () => {
    render(<App />);
    openDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    openDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('status').textContent).toBe('report.pdf was deleted.');
  });

  test('renders into document.body and locks scrolling', () => {
    const { container } = render(<App />);
    const dialog = openDialog();
    expect(container.contains(dialog)).toBe(false);
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(document.activeElement, { key: 'Escape' });
    expect(document.body.style.overflow).toBe('');
  });
});
