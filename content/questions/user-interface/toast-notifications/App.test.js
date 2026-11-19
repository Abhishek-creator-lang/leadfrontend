import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';

const wait = (ms) => act(() => new Promise((r) => setTimeout(r, ms)));
const click = (name) => fireEvent.click(screen.getByRole('button', { name }));
const dismissButtons = () => screen.queryAllByRole('button', { name: 'Dismiss notification' });

describe('Toast notifications', () => {
  test('live regions exist before any toast is shown', () => {
    render(<App />);
    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(dismissButtons()).toHaveLength(0);
  });

  test('success goes to the polite region, errors to the assertive one', () => {
    render(<App />);
    click('Show success');
    click('Show error');
    expect(screen.getByRole('status').textContent).toMatch(/Changes saved\./);
    expect(screen.getByRole('alert').textContent).toMatch(/Couldn’t connect/);
    expect(screen.getByRole('status').textContent).not.toMatch(/Couldn’t connect/);
  });

  test('dismiss removes a toast', () => {
    render(<App />);
    click('Show info');
    expect(dismissButtons()).toHaveLength(1);
    fireEvent.click(dismissButtons()[0]);
    expect(dismissButtons()).toHaveLength(0);
  });

  test('keeps at most three toasts, dropping the oldest', () => {
    render(<App />);
    click('Show success');
    click('Show info');
    click('Show info');
    click('Show info');
    expect(dismissButtons()).toHaveLength(3);
    expect(screen.getByRole('status').textContent).not.toMatch(/Changes saved/);
  });

  test('auto-dismisses, but not while hovered', async () => {
    render(<App toastDuration={200} />);
    click('Show success');
    const toast = dismissButtons()[0].closest('li');
    fireEvent.mouseEnter(toast);
    await wait(350);
    expect(dismissButtons()).toHaveLength(1);
    fireEvent.mouseLeave(toast);
    await wait(350);
    expect(dismissButtons()).toHaveLength(0);
  });
});
