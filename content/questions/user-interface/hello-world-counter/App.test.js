import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const value = () => screen.getByRole('status').textContent.trim();
const btn = (name) => screen.getByRole('button', { name });

describe('Counter', () => {
  test('starts at 0 with decrement and reset disabled', () => {
    render(<App />);
    expect(value()).toBe('0');
    expect(btn('Decrement').disabled).toBe(true);
    expect(btn('Reset').disabled).toBe(true);
  });

  test('increment and decrement change the count', () => {
    render(<App />);
    fireEvent.click(btn('Increment'));
    fireEvent.click(btn('Increment'));
    fireEvent.click(btn('Increment'));
    expect(value()).toBe('3');
    fireEvent.click(btn('Decrement'));
    expect(value()).toBe('2');
    expect(btn('Decrement').disabled).toBe(false);
  });

  test('never goes below zero', () => {
    render(<App />);
    fireEvent.click(btn('Increment'));
    fireEvent.click(btn('Decrement'));
    fireEvent.click(btn('Decrement'));
    expect(value()).toBe('0');
    expect(btn('Decrement').disabled).toBe(true);
  });

  test('reset returns to zero', () => {
    render(<App />);
    fireEvent.click(btn('Increment'));
    fireEvent.click(btn('Increment'));
    fireEvent.click(btn('Reset'));
    expect(value()).toBe('0');
    expect(btn('Reset').disabled).toBe(true);
  });
});
