import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const set = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
// The value cell that follows a given <dt> label.
const result = (term) => screen.getByText(term).nextElementSibling.textContent;

describe('Mortgage calculator', () => {
  test('computes the defaults on first render', () => {
    render(<App />);
    expect(result('Monthly payment')).toBe('$1,896.20');
  });

  test('updates monthly payment, total and interest as the user types', () => {
    render(<App />);
    set('Loan amount ($)', '100000');
    set('Annual interest rate (%)', '6');
    set('Loan term (years)', '30');
    expect(result('Monthly payment')).toBe('$599.55');
    expect(result('Total paid')).toBe('$215,838.19');
    expect(result('Total interest')).toBe('$115,838.19');
  });

  test('handles a 0% interest rate', () => {
    render(<App />);
    set('Loan amount ($)', '36000');
    set('Annual interest rate (%)', '0');
    set('Loan term (years)', '3');
    expect(result('Monthly payment')).toBe('$1,000.00');
    expect(result('Total interest')).toBe('$0.00');
  });

  test('invalid input is flagged and results show a dash', () => {
    render(<App />);
    set('Loan term (years)', '0');
    const years = screen.getByLabelText('Loan term (years)');
    expect(years.getAttribute('aria-invalid')).toBe('true');
    expect(document.getElementById(years.getAttribute('aria-describedby'))).toBeTruthy();
    expect(result('Monthly payment')).toBe('—');
    set('Loan amount ($)', 'abc');
    expect(screen.getByLabelText('Loan amount ($)').getAttribute('aria-invalid')).toBe('true');
  });
});
