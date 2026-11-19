import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App, { move } from './App';

const order = () => Array.from(document.querySelectorAll('.sortable li')).map((li) => li.textContent.replace('⠿', '').trim());
const handle = (label) => screen.getByRole('button', { name: `Reorder ${label}` });
const key = (k) => fireEvent.keyDown(document.activeElement, { key: k });
const status = () => screen.getByRole('status').textContent;
const INITIAL = ['Fix login bug', 'Review PR #42', 'Update docs', 'Plan sprint', 'Refactor API client'];

describe('Sortable list', () => {
  test('move() returns a reordered copy', () => {
    const list = [1, 2, 3, 4];
    expect(move(list, 0, 2)).toEqual([2, 3, 1, 4]);
    expect(list).toEqual([1, 2, 3, 4]);
  });

  test('every handle is a described button', () => {
    render(<App />);
    expect(order()).toEqual(INITIAL);
    const h = handle('Update docs');
    expect(h.getAttribute('aria-pressed')).toBe('false');
    expect(document.getElementById(h.getAttribute('aria-describedby')).textContent).toMatch(/space or enter/i);
  });

  test('Space picks up, arrows move, Space drops', () => {
    render(<App />);
    handle('Review PR #42').focus();
    key(' ');
    expect(handle('Review PR #42').getAttribute('aria-pressed')).toBe('true');
    expect(status()).toBe('Picked up Review PR #42. Position 2 of 5.');
    key('ArrowDown');
    expect(order()[2]).toBe('Review PR #42');
    expect(status()).toBe('Review PR #42 moved to position 3 of 5.');
    expect(document.activeElement).toBe(handle('Review PR #42'));
    key('ArrowDown');
    key(' ');
    expect(order()).toEqual(['Fix login bug', 'Update docs', 'Plan sprint', 'Review PR #42', 'Refactor API client']);
    expect(status()).toBe('Dropped Review PR #42 at position 4 of 5.');
    expect(handle('Review PR #42').getAttribute('aria-pressed')).toBe('false');
  });

  test('arrows do nothing unless an item is picked up', () => {
    render(<App />);
    handle('Update docs').focus();
    key('ArrowUp');
    expect(order()).toEqual(INITIAL);
  });

  test('moving stays within bounds', () => {
    render(<App />);
    handle('Fix login bug').focus();
    key('Enter');
    key('ArrowUp');
    expect(order()).toEqual(INITIAL);
    key('Enter');
  });

  test('Escape cancels and restores the original order', () => {
    render(<App />);
    handle('Plan sprint').focus();
    key(' ');
    key('ArrowUp');
    key('ArrowUp');
    expect(order()[1]).toBe('Plan sprint');
    key('Escape');
    expect(order()).toEqual(INITIAL);
    expect(status()).toBe('Reorder cancelled. Plan sprint returned to position 4 of 5.');
    expect(handle('Plan sprint').getAttribute('aria-pressed')).toBe('false');
    expect(document.activeElement).toBe(handle('Plan sprint'));
  });
});
