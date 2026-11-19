import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const c = () => screen.getByLabelText('Celsius');
const f = () => screen.getByLabelText('Fahrenheit');
const type = (el, value) => fireEvent.change(el, { target: { value } });

describe('Temperature converter', () => {
  test('Celsius updates Fahrenheit', () => {
    render(<App />);
    type(c(), '100');
    expect(f().value).toBe('212');
    type(c(), '-40');
    expect(f().value).toBe('-40');
  });

  test('Fahrenheit updates Celsius with at most 4 decimals', () => {
    render(<App />);
    type(f(), '32');
    expect(c().value).toBe('0');
    type(f(), '100');
    expect(c().value).toBe('37.7778');
  });

  test('does not rewrite the field being typed in', () => {
    render(<App />);
    type(c(), '1.');
    expect(c().value).toBe('1.');
    expect(f().value).toBe('33.8');
  });

  test('invalid input is flagged and leaves the other field alone', () => {
    render(<App />);
    type(c(), '20');
    type(c(), '20abc');
    expect(c().getAttribute('aria-invalid')).toBe('true');
    expect(document.getElementById(c().getAttribute('aria-describedby'))).toBeTruthy();
    expect(f().value).toBe('68');
    type(c(), '25');
    expect(c().getAttribute('aria-invalid')).toBeNull();
    expect(f().value).toBe('77');
  });

  test('clearing one field clears the other', () => {
    render(<App />);
    type(f(), '50');
    type(f(), '');
    expect(c().value).toBe('');
  });
});
