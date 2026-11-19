import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';

const wait = (ms) => act(() => new Promise((r) => setTimeout(r, ms)));
const display = () => screen.getByRole('timer').textContent;
const click = (name) => fireEvent.click(screen.getByRole('button', { name }));
const toMs = (text) => {
  const [m, rest] = text.split(':');
  return Number(m) * 60000 + Number(rest) * 1000;
};

describe('Stopwatch', () => {
  test('starts at zero with reset disabled', () => {
    render(<App />);
    expect(display()).toBe('00:00.00');
    expect(screen.getByRole('button', { name: 'Reset' }).disabled).toBe(true);
  });

  test('start runs the clock and stop freezes it', async () => {
    render(<App />);
    click('Start');
    expect(screen.getByRole('button', { name: 'Stop' })).toBeTruthy();
    await wait(300);
    click('Stop');
    const frozen = display();
    expect(toMs(frozen)).toBeGreaterThan(150);
    expect(toMs(frozen)).toBeLessThan(2000);
    await wait(200);
    expect(display()).toBe(frozen);
  });

  test('resuming continues from the stopped time', async () => {
    render(<App />);
    click('Start');
    await wait(200);
    click('Stop');
    const first = toMs(display());
    click('Start');
    await wait(200);
    click('Stop');
    expect(toMs(display())).toBeGreaterThan(first + 100);
  });

  test('lap records splits while running, reset clears everything', async () => {
    render(<App />);
    click('Start');
    await wait(120);
    click('Lap');
    await wait(120);
    click('Lap');
    const laps = screen.getByRole('list', { name: 'Laps' }).querySelectorAll('li');
    expect(laps).toHaveLength(2);
    expect(laps[0].textContent).toMatch(/Lap 2/);
    click('Stop');
    click('Reset');
    expect(display()).toBe('00:00.00');
    expect(screen.queryByRole('list', { name: 'Laps' })).toBeNull();
  });
});
