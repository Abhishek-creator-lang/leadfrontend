import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App, { TrafficLight } from './App';

const wait = (ms) => act(() => new Promise((r) => setTimeout(r, ms)));
const label = () => screen.getByRole('img').getAttribute('aria-label');

const FAST = {
  green: { duration: 120, next: 'yellow' },
  yellow: { duration: 120, next: 'red' },
  red: { duration: 120, next: 'green' },
};

describe('TrafficLight', () => {
  test('starts green with an accessible name', () => {
    render(<App />);
    expect(label()).toMatch(/^Traffic light: green/);
  });

  test('cycles through the configured states', async () => {
    render(<TrafficLight config={FAST} />);
    expect(label()).toMatch(/green/);
    await wait(180);
    expect(label()).toMatch(/yellow/);
    await wait(120);
    expect(label()).toMatch(/red/);
  });

  test('supports an initial state and custom configs', async () => {
    const pedestrian = { stop: { duration: 100, next: 'walk' }, walk: { duration: 5000, next: 'stop' } };
    render(<TrafficLight config={pedestrian} initial="stop" />);
    expect(label()).toMatch(/stop/);
    await wait(170);
    expect(label()).toMatch(/walk/);
  });

  test('pause stops the cycle and resume continues it', async () => {
    render(<TrafficLight config={FAST} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    expect(label()).toMatch(/paused/);
    await wait(250);
    expect(label()).toMatch(/green/);
    fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
    await wait(200);
    expect(label()).toMatch(/yellow/);
  });
});
