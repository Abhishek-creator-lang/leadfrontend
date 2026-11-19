import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App, { Accordion } from './App';

const ITEMS = [
  { value: 'a', title: 'First', contents: 'One' },
  { value: 'b', title: 'Second', contents: 'Two' },
  { value: 'c', title: 'Third', contents: 'Three' },
];
const trigger = (name) => screen.getByRole('button', { name });
const expanded = (name) => trigger(name).getAttribute('aria-expanded');

describe('Single-open accordion', () => {
  test('starts collapsed and opening one closes the other', () => {
    render(<Accordion items={ITEMS} />);
    expect(screen.queryAllByRole('region')).toHaveLength(0);
    fireEvent.click(trigger('First'));
    expect(expanded('First')).toBe('true');
    fireEvent.click(trigger('Second'));
    expect(expanded('First')).toBe('false');
    expect(expanded('Second')).toBe('true');
    expect(screen.getAllByRole('region')).toHaveLength(1);
  });

  test('collapsible (default) lets the open section close', () => {
    render(<Accordion items={ITEMS} defaultValue="b" />);
    expect(expanded('Second')).toBe('true');
    fireEvent.click(trigger('Second'));
    expect(expanded('Second')).toBe('false');
  });

  test('collapsible={false} keeps one section open', () => {
    render(<Accordion items={ITEMS} defaultValue="a" collapsible={false} />);
    fireEvent.click(trigger('First'));
    expect(expanded('First')).toBe('true');
    expect(trigger('First').getAttribute('aria-disabled')).toBe('true');
  });

  test('controlled: calls onValueChange and follows the value prop', () => {
    const calls = [];
    const { rerender } = render(<Accordion items={ITEMS} value="a" onValueChange={(v) => calls.push(v)} />);
    fireEvent.click(trigger('Third'));
    expect(calls).toEqual(['c']);
    expect(expanded('First')).toBe('true');
    expect(expanded('Third')).toBe('false');
    rerender(<Accordion items={ITEMS} value="c" onValueChange={(v) => calls.push(v)} />);
    expect(expanded('Third')).toBe('true');
  });

  test('demo app reports the open section', () => {
    render(<App />);
    expect(screen.getByText(/Open section: none/)).toBeTruthy();
    fireEvent.click(trigger('Can I return an item?'));
    expect(screen.getByText(/Open section: Can I return an item\?/)).toBeTruthy();
  });

  test('arrow keys move focus between headers', () => {
    render(<Accordion items={ITEMS} />);
    trigger('First').focus();
    fireEvent.keyDown(document.activeElement, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(trigger('Third'));
    fireEvent.keyDown(document.activeElement, { key: 'Home' });
    expect(document.activeElement).toBe(trigger('First'));
  });
});
