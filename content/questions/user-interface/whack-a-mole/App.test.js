import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WhackAMole } from './App';

// random() === 0 → always one mole, always in hole 1.
const setup = (duration = 400) =>
  render(<WhackAMole duration={duration} moleInterval={5000} random={() => 0} />);
const hole = (n) => screen.getByRole('button', { name: new RegExp(`^Hole ${n},`) });
const label = (n) => hole(n).getAttribute('aria-label');
const start = () => fireEvent.click(screen.getByRole('button', { name: /start game|play again/i }));

describe('Whack-a-Mole', () => {
  test('all holes are empty before the game starts', () => {
    setup();
    expect(screen.getAllByRole('button', { name: /^Hole \d, empty$/ })).toHaveLength(9);
  });

  test('starting shows a mole immediately; hitting it scores once', () => {
    setup(5000);
    start();
    expect(label(1)).toBe('Hole 1, mole');
    fireEvent.click(hole(1));
    expect(screen.getByText('Score: 1')).toBeTruthy();
    expect(label(1)).toBe('Hole 1, empty');
    fireEvent.click(hole(1));
    fireEvent.click(hole(5));
    expect(screen.getByText('Score: 1')).toBeTruthy();
  });

  test('number keys hit the matching hole', () => {
    setup(5000);
    start();
    fireEvent.keyDown(window, { key: '5' });
    expect(screen.getByText('Score: 0')).toBeTruthy();
    fireEvent.keyDown(window, { key: '1' });
    expect(screen.getByText('Score: 1')).toBeTruthy();
  });

  test('clicks before the game starts do nothing', () => {
    setup();
    fireEvent.click(hole(1));
    expect(screen.getByText('Score: 0')).toBeTruthy();
  });

  test('the round ends after the duration and can be replayed', async () => {
    setup(300);
    start();
    fireEvent.click(hole(1));
    await waitFor(() => expect(screen.getByRole('status').textContent).toMatch(/time's up! final score: 1/i));
    expect(screen.getAllByRole('button', { name: /empty$/ })).toHaveLength(9);
    start();
    expect(screen.getByText('Score: 0')).toBeTruthy();
    expect(label(1)).toBe('Hole 1, mole');
  });
});
