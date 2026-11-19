import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Wordle, scoreGuess } from './App';

const WORDS = ['crane', 'react', 'eerie', 'paper', 'apple', 'lemon', 'ghost', 'stone', 'plant'];

const tiles = (n) => Array.from(screen.getByRole('group', { name: `Guess ${n}` }).querySelectorAll('.tile'));
const letters = (n) => tiles(n).map((t) => t.textContent.slice(0, 1)).join('');
const states = (n) => tiles(n).map((t) => t.getAttribute('data-state'));
const key = (k) => screen.getByRole('button', { name: new RegExp(`^${k}(,|$)`, 'i') });
const type = (word) => [...word].forEach((ch) => fireEvent.keyDown(window, { key: ch }));
const submit = (word) => {
  type(word);
  fireEvent.keyDown(window, { key: 'Enter' });
};
const alertText = () => screen.getByRole('alert').textContent;

describe('scoreGuess', () => {
  test('marks exact, present and absent letters', () => {
    expect(scoreGuess('react', 'crane')).toEqual(['present', 'present', 'correct', 'present', 'absent']);
  });

  test('handles duplicate letters like the real game', () => {
    expect(scoreGuess('eerie', 'crane')).toEqual(['absent', 'absent', 'present', 'absent', 'correct']);
    expect(scoreGuess('apple', 'paper')).toEqual(['present', 'present', 'correct', 'absent', 'present']);
  });
});

describe('Wordle', () => {
  test('physical keyboard types into the current row and Backspace deletes', () => {
    render(<Wordle answer="crane" words={WORDS} />);
    type('lemx');
    expect(letters(1)).toBe('lemx');
    fireEvent.keyDown(window, { key: 'Backspace' });
    type('onz');
    expect(letters(1)).toBe('lemon');
    fireEvent.keyDown(window, { key: 'a', ctrlKey: true });
    expect(letters(1)).toBe('lemon');
  });

  test('on-screen keyboard works', () => {
    render(<Wordle answer="crane" words={WORDS} />);
    ['G', 'H', 'O', 'S', 'T'].forEach((k) => fireEvent.click(key(k)));
    expect(letters(1)).toBe('ghost');
    fireEvent.click(key('Enter'));
    expect(states(1)).toEqual(['absent', 'absent', 'absent', 'absent', 'absent']);
    expect(letters(2)).toBe('');
  });

  test('rejects short and unknown words without consuming a guess', () => {
    render(<Wordle answer="crane" words={WORDS} />);
    submit('cra');
    expect(alertText()).toMatch(/not enough letters/i);
    type('nx');
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(alertText()).toMatch(/not in word list/i);
    expect(letters(1)).toBe('cranx');
    expect(states(1)).not.toContain('absent');
  });

  test('scores a guess and colours the keyboard with the best state', () => {
    render(<Wordle answer="crane" words={WORDS} />);
    submit('react');
    expect(states(1)).toEqual(['present', 'present', 'correct', 'present', 'absent']);
    expect(key('A').getAttribute('aria-label')).toMatch(/correct/i);
    expect(key('T').getAttribute('aria-label')).toMatch(/absent/i);
    expect(key('R').getAttribute('aria-label')).toMatch(/present/i);
    submit('crane');
    expect(key('R').getAttribute('aria-label')).toMatch(/correct/i);
  });

  test('winning ends the game', () => {
    render(<Wordle answer="crane" words={WORDS} />);
    submit('crane');
    expect(alertText()).toMatch(/you win/i);
    type('lemon');
    expect(letters(2)).toBe('');
    expect(screen.getByRole('button', { name: /play again/i })).toBeTruthy();
  });

  test('six wrong guesses reveal the answer', () => {
    render(<Wordle answer="crane" words={WORDS} />);
    ['react', 'eerie', 'paper', 'apple', 'lemon', 'ghost'].forEach(submit);
    expect(alertText()).toMatch(/the word was crane/i);
    fireEvent.click(screen.getByRole('button', { name: /play again/i }));
    expect(letters(1)).toBe('');
  });
});
