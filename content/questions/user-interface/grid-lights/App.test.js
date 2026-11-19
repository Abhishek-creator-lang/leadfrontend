import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GridLights } from './App';

const light = (r, c) => screen.getByRole('button', { name: `Light at row ${r}, column ${c}` });
const pressed = (r, c) => light(r, c).getAttribute('aria-pressed');
// Activation order used in the tests (every light of the default 3 x 3 ring).
const ORDER = [[1, 1], [1, 2], [1, 3], [2, 3], [3, 3], [3, 2], [3, 1], [2, 1]];

describe('GridLights', () => {
  test('renders one toggle per 1 in the config, all off', () => {
    render(<GridLights />);
    const lights = screen.getAllByRole('button', { name: /^Light at row/ });
    expect(lights).toHaveLength(8);
    expect(lights.every((l) => l.getAttribute('aria-pressed') === 'false')).toBe(true);
    expect(screen.queryByRole('button', { name: 'Light at row 2, column 2' })).toBeNull();
  });

  test('clicking turns a light on, and clicking again keeps it on', () => {
    render(<GridLights />);
    fireEvent.click(light(1, 1));
    expect(pressed(1, 1)).toBe('true');
    fireEvent.click(light(1, 1));
    expect(pressed(1, 1)).toBe('true');
  });

  test('once all are on, they switch off in reverse order', async () => {
    // A generous delay keeps the "others are still on" checks stable on a busy machine.
    render(<GridLights delay={500} />);
    ORDER.forEach(([r, c]) => fireEvent.click(light(r, c)));
    expect(screen.getByRole('status').textContent).toMatch(/all lights on/i);
    // The last light activated goes off first while the others are still on.
    await waitFor(() => expect(pressed(2, 1)).toBe('false'), { timeout: 3000 });
    expect(pressed(3, 1)).toBe('true');
    expect(pressed(1, 1)).toBe('true');
    await waitFor(() => expect(pressed(3, 1)).toBe('false'), { timeout: 3000 });
    expect(pressed(1, 1)).toBe('true');
  });

  test('clicks are ignored while deactivating, then the grid works again', async () => {
    render(<GridLights delay={300} />);
    ORDER.forEach(([r, c]) => fireEvent.click(light(r, c)));
    await waitFor(() => expect(pressed(2, 1)).toBe('false'), { timeout: 3000 });
    fireEvent.click(light(2, 1));
    expect(pressed(2, 1)).toBe('false');
    await waitFor(() => expect(pressed(1, 1)).toBe('false'), { timeout: 5000 });
    fireEvent.click(light(2, 1));
    expect(pressed(2, 1)).toBe('true');
  });

  test('follows a custom config', () => {
    render(<GridLights config={[[1, 0, 1, 1]]} />);
    expect(screen.getAllByRole('button', { name: /^Light at row/ })).toHaveLength(3);
    expect(light(1, 4)).toBeTruthy();
  });
});
