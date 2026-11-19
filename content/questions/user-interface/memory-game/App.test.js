import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryGame, shuffleArray } from './App';

const SYMBOLS = [
  { name: 'Apple', emoji: '🍎' },
  { name: 'Pear', emoji: '🍐' },
  { name: 'Cherry', emoji: '🍒' },
];
// Identity shuffle → deck order: Apple, Apple, Pear, Pear, Cherry, Cherry
const setup = (delay = 50) =>
  render(<MemoryGame symbols={SYMBOLS} shuffle={(cards) => cards.slice()} mismatchDelay={delay} />);
const card = (n) => screen.getByRole('button', { name: new RegExp(`^Card ${n},`) });
const label = (n) => card(n).getAttribute('aria-label');
const status = () => screen.getByRole('status').textContent;

describe('Memory game', () => {
  test('all cards start face down', () => {
    setup();
    expect(screen.getAllByRole('button', { name: /^Card \d+, face down$/ })).toHaveLength(6);
  });

  test('a matching pair stays face up and counts one move', () => {
    setup();
    fireEvent.click(card(1));
    expect(label(1)).toBe('Card 1, Apple');
    fireEvent.click(card(2));
    expect(label(1)).toBe('Card 1, Apple, matched');
    expect(label(2)).toBe('Card 2, Apple, matched');
    expect(status()).toMatch(/match: apple/i);
    expect(screen.getByText(/moves: 1/i)).toBeTruthy();
  });

  test('a mismatched pair flips back after the delay', async () => {
    setup();
    fireEvent.click(card(1));
    fireEvent.click(card(3));
    expect(label(3)).toBe('Card 3, Pear');
    expect(status()).toMatch(/no match/i);
    await waitFor(() => expect(label(1)).toBe('Card 1, face down'));
    expect(label(3)).toBe('Card 3, face down');
  });

  test('clicking a third card resolves the mismatch immediately', () => {
    setup(5000);
    fireEvent.click(card(1));
    fireEvent.click(card(3));
    fireEvent.click(card(5));
    expect(label(1)).toBe('Card 1, face down');
    expect(label(3)).toBe('Card 3, face down');
    expect(label(5)).toBe('Card 5, Cherry');
  });

  test('clicking the same card twice is ignored', () => {
    setup();
    fireEvent.click(card(1));
    fireEvent.click(card(1));
    expect(label(1)).toBe('Card 1, Apple');
    expect(screen.getByText(/moves: 0/i)).toBeTruthy();
  });

  test('matching every pair wins, and New game resets', () => {
    setup();
    [1, 2, 3, 4, 5, 6].forEach((n) => fireEvent.click(card(n)));
    expect(screen.getByText(/you found all 3 pairs in 3 moves/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /new game/i }));
    expect(screen.getAllByRole('button', { name: /face down$/ })).toHaveLength(6);
  });

  test('shuffleArray returns a permutation without mutating the input', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const out = shuffleArray(input);
    expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(out === input).toBe(false);
    expect(out.slice().sort((a, b) => a - b)).toEqual(input);
  });
});
