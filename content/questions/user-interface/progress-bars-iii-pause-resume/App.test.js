import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';

const wait = (ms) => act(() => new Promise((r) => setTimeout(r, ms)));
const values = () => screen.getAllByRole('progressbar').map((el) => Number(el.getAttribute('aria-valuenow')));
const click = (name) => fireEvent.click(screen.getByRole('button', { name }));

describe('Progress bars with pause and resume', () => {
  test('respects the concurrency limit', async () => {
    render(<App />);
    for (let i = 0; i < 4; i++) click('Add');
    await wait(300);
    const v = values();
    expect(v[2] > 0).toBe(true);
    expect(v[3]).toBe(0);
    expect(screen.getByRole('progressbar', { name: 'Download 4' }).getAttribute('aria-valuetext')).toBe('Queued');
  });

  test('pause freezes progress and resume continues from the same point', async () => {
    render(<App />);
    click('Add');
    await wait(300);
    click('Pause');
    expect(screen.getByRole('button', { name: 'Resume' })).toBeTruthy();
    expect(screen.getByText(/Paused/)).toBeTruthy();
    const frozen = values()[0];
    expect(frozen > 0 && frozen < 100).toBe(true);
    await wait(300);
    expect(values()[0]).toBe(frozen);
    click('Resume');
    await wait(300);
    const resumed = values()[0];
    expect(resumed > frozen).toBe(true);
    // No jump by the paused time: 300ms paused + 300ms running is well under the 600ms+ a jump would add.
    expect(resumed - frozen < 30).toBe(true);
  });

  test('bars added while paused stay at 0', async () => {
    render(<App />);
    click('Pause');
    click('Add');
    await wait(250);
    expect(values()[0]).toBe(0);
  });

  test('reset clears all bars and unpauses', () => {
    render(<App />);
    click('Add');
    click('Pause');
    click('Reset');
    expect(screen.queryAllByRole('progressbar')).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Pause' })).toBeTruthy();
  });
});
