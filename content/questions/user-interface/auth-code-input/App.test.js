import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const box = (n) => screen.getByLabelText(`Digit ${n} of 6`);
const verify = () => screen.getByRole('button', { name: /verify/i });

describe('AuthCodeInput', () => {
  test('renders six labelled boxes inside a group', () => {
    render(<App />);
    for (let n = 1; n <= 6; n++) expect(box(n)).toBeTruthy();
    expect(screen.getByRole('group')).toBeTruthy();
  });

  test('typing a digit fills the box and moves focus to the next one', () => {
    render(<App />);
    box(1).focus();
    fireEvent.change(box(1), { target: { value: '4' } });
    expect(box(1).value).toBe('4');
    expect(document.activeElement).toBe(box(2));
  });

  test('non-digits are ignored', () => {
    render(<App />);
    box(1).focus();
    fireEvent.change(box(1), { target: { value: 'a' } });
    expect(box(1).value).toBe('');
    expect(document.activeElement).toBe(box(1));
  });

  test('Backspace in an empty box clears the previous box and focuses it', () => {
    render(<App />);
    fireEvent.change(box(1), { target: { value: '1' } });
    fireEvent.change(box(2), { target: { value: '2' } });
    box(3).focus();
    fireEvent.keyDown(box(3), { key: 'Backspace' });
    expect(document.activeElement).toBe(box(2));
    expect(box(2).value).toBe('');
    expect(box(1).value).toBe('1');
  });

  test('arrow keys move focus between boxes', () => {
    render(<App />);
    box(3).focus();
    fireEvent.keyDown(box(3), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(box(4));
    fireEvent.keyDown(box(4), { key: 'ArrowLeft' });
    fireEvent.keyDown(box(3), { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(box(2));
  });

  test('pasting distributes digits and enables submit', () => {
    render(<App />);
    expect(verify().disabled).toBe(true);
    box(1).focus();
    fireEvent.paste(box(1), { clipboardData: { getData: () => '482 913' } });
    expect([1, 2, 3, 4, 5, 6].map((n) => box(n).value).join('')).toBe('482913');
    expect(verify().disabled).toBe(false);
    fireEvent.click(verify());
    expect(screen.getByRole('status').textContent).toBe('Code 482913 submitted');
  });

  test('pasting from the middle fills from that box onwards', () => {
    render(<App />);
    fireEvent.paste(box(4), { clipboardData: { getData: () => '7890' } });
    expect(box(3).value).toBe('');
    expect(box(4).value).toBe('7');
    expect(box(6).value).toBe('9');
  });
});
