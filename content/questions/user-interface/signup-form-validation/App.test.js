import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const field = (label) => screen.getByLabelText(label, { selector: 'input' });
const type = (label, value) => fireEvent.change(field(label), { target: { value } });
const blur = (label) => fireEvent.blur(field(label));
const invalid = (label) => field(label).getAttribute('aria-invalid');
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

describe('Sign-up form', () => {
  test('no errors before a field is touched; error appears on blur', () => {
    render(<App />);
    type('Email', 'nope');
    expect(invalid('Email')).toBeNull();
    blur('Email');
    expect(invalid('Email')).toBe('true');
    const describedBy = field('Email').getAttribute('aria-describedby');
    expect(document.getElementById(describedBy).textContent).toMatch(/valid email/i);
    type('Email', 'dev@example.com');
    expect(invalid('Email')).toBeNull();
  });

  test('password checklist reflects each rule and is linked to the input', () => {
    render(<App />);
    type('Password', 'abc');
    const list = document.getElementById(field('Password').getAttribute('aria-describedby').split(' ')[0]);
    const items = list.querySelectorAll('li');
    expect(items).toHaveLength(3);
    expect(Array.from(items).map((li) => li.textContent.includes('(met)'))).toEqual([false, true, false]);
    type('Password', 'abcdefg1');
    expect(Array.from(list.querySelectorAll('li')).every((li) => li.textContent.includes('(met)'))).toBe(true);
  });

  test('confirm password is cross-checked when the password changes', () => {
    render(<App />);
    type('Password', 'secret123');
    type('Confirm password', 'secret123');
    blur('Confirm password');
    expect(invalid('Confirm password')).toBeNull();
    type('Password', 'secret1234');
    expect(invalid('Confirm password')).toBe('true');
  });

  test('show password toggles the input type', () => {
    render(<App />);
    const toggle = screen.getByRole('button', { name: 'Show password' });
    expect(field('Password').getAttribute('type')).toBe('password');
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(field('Password').getAttribute('type')).toBe('text');
  });

  test('submit validates everything and focuses the first invalid field', () => {
    render(<App />);
    type('Username', 'grace_h');
    submit();
    expect(invalid('Username')).toBeNull();
    expect(invalid('Email')).toBe('true');
    expect(invalid('Password')).toBe('true');
    expect(document.activeElement).toBe(field('Email'));
  });

  test('valid submit shows a welcome message', () => {
    render(<App />);
    type('Username', 'grace_h');
    type('Email', 'grace@example.com');
    type('Password', 'compiler42');
    type('Confirm password', 'compiler42');
    submit();
    expect(screen.getByRole('status').textContent).toMatch(/Welcome, grace_h!/);
  });
});
