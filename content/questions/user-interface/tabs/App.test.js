import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App, { Tabs } from './App';

const tab = (name) => screen.getByRole('tab', { name });

describe('Tabs', () => {
  test('renders a labelled tablist with one tab per item', () => {
    render(<App />);
    const list = screen.getByRole('tablist');
    expect(list.getAttribute('aria-label')).toBeTruthy();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  test('the first tab is selected and only its panel is visible', () => {
    render(<App />);
    expect(tab('Overview').getAttribute('aria-selected')).toBe('true');
    expect(tab('Pricing').getAttribute('aria-selected')).toBe('false');
    const panels = screen.getAllByRole('tabpanel');
    expect(panels).toHaveLength(1);
    expect(panels[0].textContent).toMatch(/quick tour/);
  });

  test('clicking a tab selects it and swaps the panel', () => {
    render(<App />);
    fireEvent.click(tab('FAQ'));
    expect(tab('FAQ').getAttribute('aria-selected')).toBe('true');
    expect(tab('Overview').getAttribute('aria-selected')).toBe('false');
    const panels = screen.getAllByRole('tabpanel');
    expect(panels).toHaveLength(1);
    expect(panels[0].textContent).toMatch(/cancel any time/);
  });

  test('tabs and panels reference each other', () => {
    render(<App />);
    const t = tab('Overview');
    const panel = document.getElementById(t.getAttribute('aria-controls'));
    expect(panel).toBeTruthy();
    expect(panel.getAttribute('role')).toBe('tabpanel');
    expect(panel.getAttribute('aria-labelledby')).toBe(t.id);
  });

  test('supports defaultValue and unique ids across instances', () => {
    const items = [
      { value: 'a', label: 'Alpha', panel: 'First' },
      { value: 'b', label: 'Beta', panel: 'Second' },
    ];
    render(
      <>
        <Tabs items={items} defaultValue="b" />
        <Tabs items={items} />
      </>
    );
    const alphas = screen.getAllByRole('tab', { name: 'Alpha' });
    const betas = screen.getAllByRole('tab', { name: 'Beta' });
    expect(betas[0].getAttribute('aria-selected')).toBe('true');
    expect(alphas[1].getAttribute('aria-selected')).toBe('true');
    expect(alphas[0].id === alphas[1].id).toBe(false);
  });
});
