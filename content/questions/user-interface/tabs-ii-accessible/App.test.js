import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App, { Tabs } from './App';

const tab = (name) => screen.getByRole('tab', { name });
const press = (key) => fireEvent.keyDown(document.activeElement, { key });

const ITEMS = [
  { value: 'a', label: 'Alpha', panel: 'Panel A' },
  { value: 'b', label: 'Beta', panel: 'Panel B' },
  { value: 'c', label: 'Gamma', panel: 'Panel C', disabled: true },
  { value: 'd', label: 'Delta', panel: 'Panel D' },
];

describe('Accessible tabs', () => {
  test('only the selected tab is in the tab sequence', () => {
    render(<App />);
    expect(tab('Inbox').getAttribute('tabindex')).toBe('0');
    expect(tab('Drafts').getAttribute('tabindex')).toBe('-1');
    expect(tab('Sent').getAttribute('tabindex')).toBe('-1');
  });

  test('automatic: arrows move focus and selection, skipping disabled tabs and wrapping', () => {
    render(<Tabs items={ITEMS} label="Test" />);
    tab('Alpha').focus();
    press('ArrowRight');
    expect(document.activeElement).toBe(tab('Beta'));
    expect(tab('Beta').getAttribute('aria-selected')).toBe('true');
    expect(tab('Beta').getAttribute('tabindex')).toBe('0');
    press('ArrowRight');
    expect(document.activeElement).toBe(tab('Delta'));
    press('ArrowRight');
    expect(document.activeElement).toBe(tab('Alpha'));
    press('ArrowLeft');
    expect(document.activeElement).toBe(tab('Delta'));
    expect(screen.getByRole('tabpanel').textContent).toBe('Panel D');
  });

  test('Home and End jump to the first and last enabled tab', () => {
    render(<Tabs items={ITEMS} label="Test" />);
    tab('Alpha').focus();
    press('End');
    expect(document.activeElement).toBe(tab('Delta'));
    press('Home');
    expect(document.activeElement).toBe(tab('Alpha'));
  });

  test('manual: arrows move focus only, Enter/click selects', () => {
    render(<Tabs items={ITEMS} label="Test" activation="manual" />);
    tab('Alpha').focus();
    press('ArrowRight');
    expect(document.activeElement).toBe(tab('Beta'));
    expect(tab('Beta').getAttribute('aria-selected')).toBe('false');
    expect(tab('Alpha').getAttribute('aria-selected')).toBe('true');
    fireEvent.click(document.activeElement);
    expect(tab('Beta').getAttribute('aria-selected')).toBe('true');
  });

  test('arrow keys prevent default scrolling', () => {
    render(<Tabs items={ITEMS} label="Test" />);
    tab('Alpha').focus();
    const notCancelled = fireEvent.keyDown(document.activeElement, { key: 'ArrowRight' });
    expect(notCancelled).toBe(false);
  });
});
