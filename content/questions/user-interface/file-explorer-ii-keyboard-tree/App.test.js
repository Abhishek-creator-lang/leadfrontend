import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const item = (name) => screen.getByRole('treeitem', { name });
const press = (key) => fireEvent.keyDown(document.activeElement, { key });

describe('FileTree (WAI-ARIA tree view)', () => {
  test('uses tree roles with a single tab stop on the first item', () => {
    render(<App />);
    expect(screen.getByRole('tree')).toBeTruthy();
    const items = screen.getAllByRole('treeitem');
    expect(items.map((el) => el.getAttribute('tabindex'))).toEqual(['0', '-1', '-1', '-1']);
    expect(item('public').getAttribute('aria-expanded')).toBe('false');
  });

  test('arrow keys move focus through visible items and roving tabindex follows', () => {
    render(<App />);
    item('public').focus();
    press('ArrowDown');
    expect(document.activeElement).toBe(item('src'));
    expect(item('src').getAttribute('tabindex')).toBe('0');
    expect(item('public').getAttribute('tabindex')).toBe('-1');
    press('End');
    expect(document.activeElement).toBe(item('README.md'));
    press('ArrowDown');
    expect(document.activeElement).toBe(item('README.md'));
    press('Home');
    expect(document.activeElement).toBe(item('public'));
  });

  test('ArrowRight opens then enters a folder; ArrowLeft goes to parent then closes', () => {
    render(<App />);
    item('public').focus();
    press('ArrowDown');
    press('ArrowRight');
    expect(item('src').getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(item('src'));
    press('ArrowRight');
    expect(document.activeElement).toBe(item('components'));
    press('ArrowLeft');
    expect(document.activeElement).toBe(item('src'));
    press('ArrowLeft');
    expect(item('src').getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('treeitem', { name: 'components' })).toBeNull();
  });

  test('children are inside a group and Enter selects a file', () => {
    render(<App />);
    item('public').focus();
    press('Enter');
    expect(item('public').getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('group')).toBeTruthy();
    press('ArrowDown');
    press('ArrowDown');
    expect(document.activeElement).toBe(item('index.html'));
    press('Enter');
    expect(item('index.html').getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText('Selected: index.html')).toBeTruthy();
  });

  test('type-ahead jumps to the next item starting with the typed letter', () => {
    render(<App />);
    item('public').focus();
    press('r');
    expect(document.activeElement).toBe(item('README.md'));
    press('p');
    expect(document.activeElement).toBe(item('public'));
    press('p');
    expect(document.activeElement).toBe(item('package.json'));
  });
});
