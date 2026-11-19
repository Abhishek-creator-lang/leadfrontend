import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const setCount = (value) => fireEvent.change(screen.getByLabelText('Number of dice'), { target: { value } });
const roll = () => fireEvent.click(screen.getByRole('button', { name: 'Roll' }));
const dieValues = () =>
  screen.getAllByRole('img').map((el) => Number(/Die showing (\d)/.exec(el.getAttribute('aria-label'))[1]));

describe('Dice roller', () => {
  test('shows a hint before the first roll', () => {
    render(<App />);
    expect(screen.queryAllByRole('img')).toHaveLength(0);
    expect(screen.getByText(/press Roll/i)).toBeTruthy();
  });

  test('rolls the requested number of dice with values 1–6', () => {
    render(<App />);
    setCount('5');
    roll();
    const values = dieValues();
    expect(values).toHaveLength(5);
    expect(values.every((v) => v >= 1 && v <= 6)).toBe(true);
  });

  test('each face draws as many pips as its value', () => {
    const { container } = render(<App />);
    setCount('4');
    roll();
    screen.getAllByRole('img').forEach((die, i) => {
      expect(die.querySelectorAll('.pip')).toHaveLength(dieValues()[i]);
    });
    expect(container.querySelectorAll('.die')).toHaveLength(4);
  });

  test('total and announcement match the dice', () => {
    render(<App />);
    setCount('3');
    roll();
    const sum = dieValues().reduce((a, b) => a + b, 0);
    expect(screen.getByText(`Total: ${sum}`)).toBeTruthy();
    expect(screen.getByRole('status').textContent).toMatch(new RegExp(`Rolled 3 dice: .*Total ${sum}\\.`));
  });

  test('rejects invalid counts', () => {
    render(<App />);
    setCount('13');
    roll();
    const input = screen.getByLabelText('Number of dice');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(document.getElementById(input.getAttribute('aria-describedby'))).toBeTruthy();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });
});
