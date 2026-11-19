import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const column = (name) => screen.getByRole('region', { name: new RegExp(`^${name}`) });
const titles = (name) =>
  Array.from(column(name).querySelectorAll('li')).map((li) => li.querySelector('.card-title').textContent);
const handle = (title) => screen.getByRole('button', { name: `Move ${title}` });
const key = (k) => fireEvent.keyDown(document.activeElement, { key: k });
const status = () => screen.getByRole('status').textContent;

describe('Kanban board', () => {
  test('renders three labelled columns with their cards', () => {
    render(<App />);
    expect(titles('To do')).toEqual(['Write tests', 'Design empty states', 'Audit bundle size']);
    expect(titles('In progress')).toEqual(['Migrate to React 18', 'Fix flaky CI job']);
    expect(titles('Done')).toEqual(['Set up linting']);
  });

  test('adds a trimmed card to the chosen column and ignores blanks', () => {
    render(<App />);
    const input = screen.getByLabelText('New card in Done');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add to Done' }));
    expect(titles('Done')).toHaveLength(1);
    fireEvent.change(input, { target: { value: '  Ship v2  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add to Done' }));
    expect(titles('Done')).toEqual(['Set up linting', 'Ship v2']);
    expect(input.value).toBe('');
  });

  test('deletes a card', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete Fix flaky CI job' }));
    expect(titles('In progress')).toEqual(['Migrate to React 18']);
  });

  test('keyboard: pick up, move to the next column, drop', () => {
    render(<App />);
    handle('Write tests').focus();
    key(' ');
    expect(handle('Write tests').getAttribute('aria-pressed')).toBe('true');
    key('ArrowRight');
    expect(titles('In progress')).toEqual(['Write tests', 'Migrate to React 18', 'Fix flaky CI job']);
    expect(titles('To do')).toHaveLength(2);
    expect(status()).toBe('Write tests moved to In progress, position 1 of 3.');
    expect(document.activeElement).toBe(handle('Write tests'));
    key('ArrowDown');
    expect(titles('In progress')[1]).toBe('Write tests');
    key('Enter');
    expect(handle('Write tests').getAttribute('aria-pressed')).toBe('false');
    expect(status()).toMatch(/dropped write tests in in progress, position 2 of 3/i);
  });

  test('index is clamped when moving into a shorter column; edges are respected', () => {
    render(<App />);
    handle('Audit bundle size').focus();
    key(' ');
    key('ArrowRight');
    key('ArrowRight');
    expect(titles('Done')).toEqual(['Set up linting', 'Audit bundle size']);
    key('ArrowRight');
    expect(titles('Done')).toEqual(['Set up linting', 'Audit bundle size']);
    key('ArrowDown');
    expect(titles('Done')).toEqual(['Set up linting', 'Audit bundle size']);
  });

  test('Escape cancels and restores the original position', () => {
    render(<App />);
    handle('Fix flaky CI job').focus();
    key('Enter');
    key('ArrowLeft');
    key('ArrowUp');
    expect(titles('To do')[0]).toBe('Fix flaky CI job');
    key('Escape');
    expect(titles('In progress')).toEqual(['Migrate to React 18', 'Fix flaky CI job']);
    expect(titles('To do')).toHaveLength(3);
    expect(status()).toMatch(/move cancelled/i);
    expect(document.activeElement).toBe(handle('Fix flaky CI job'));
  });

  test('arrow keys do nothing until a card is picked up', () => {
    render(<App />);
    handle('Write tests').focus();
    key('ArrowRight');
    expect(titles('To do')).toHaveLength(3);
  });
});
