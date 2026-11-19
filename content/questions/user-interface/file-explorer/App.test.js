import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const folder = (name) => screen.getByRole('button', { name: new RegExp(`${name}$`) });

describe('FileExplorer', () => {
  test('folders are buttons that start collapsed and hide their children', () => {
    render(<App />);
    expect(folder('src').getAttribute('aria-expanded')).toBe('false');
    expect(folder('public').getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText('index.js')).toBeNull();
  });

  test('clicking a folder toggles its children', () => {
    render(<App />);
    fireEvent.click(folder('src'));
    expect(folder('src').getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('index.js')).toBeTruthy();
    fireEvent.click(folder('src'));
    expect(screen.queryByText('index.js')).toBeNull();
  });

  test('root lists folders first, then files, alphabetically', () => {
    render(<App />);
    const rootItems = Array.from(document.querySelector('ul').children).map((li) => li.textContent.trim());
    expect(rootItems.map((t) => t.replace(/[^\w.]/g, ''))).toEqual(['public', 'src', 'package.json', 'README.md']);
  });

  test('nested levels are sorted too', () => {
    render(<App />);
    fireEvent.click(folder('src'));
    const nested = folder('src').closest('li').querySelector('ul');
    const names = Array.from(nested.children).map((li) => li.textContent.replace(/[^\w.]/g, ''));
    expect(names).toEqual(['components', 'utils', 'App.js', 'index.js']);
  });

  test('nested open state survives collapsing the parent', () => {
    render(<App />);
    fireEvent.click(folder('src'));
    fireEvent.click(folder('components'));
    expect(screen.getByText('Header.js')).toBeTruthy();
    fireEvent.click(folder('src'));
    fireEvent.click(folder('src'));
    expect(screen.getByText('Header.js')).toBeTruthy();
  });
});
