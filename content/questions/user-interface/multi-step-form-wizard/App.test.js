import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App, { Wizard } from './App';

const field = (label) => screen.getByLabelText(label);
const type = (label, value) => fireEvent.change(field(label), { target: { value } });
const next = () => fireEvent.click(screen.getByRole('button', { name: 'Next' }));
const currentStep = () => document.querySelector('[aria-current="step"]').textContent;

function completeAccount() {
  type('Email', 'sam@example.com');
  type('Password', 'correct-horse');
  next();
}

function completeProfile() {
  type('Full name', 'Sam Rivera');
  fireEvent.change(field('Role'), { target: { value: 'Designer' } });
  next();
}

describe('Multi-step form wizard', () => {
  test('starts on step 1 with no errors shown', () => {
    render(<App />);
    expect(currentStep()).toMatch(/account/i);
    expect(field('Email').getAttribute('aria-invalid')).toBeNull();
  });

  test('Next validates the step and focuses the first invalid field', () => {
    render(<App />);
    type('Password', 'short');
    next();
    expect(currentStep()).toMatch(/account/i);
    const email = field('Email');
    expect(email.getAttribute('aria-invalid')).toBe('true');
    expect(document.getElementById(email.getAttribute('aria-describedby')).textContent).toMatch(/required/i);
    expect(document.activeElement).toBe(email);
    expect(screen.getByText(/at least 8 characters/i)).toBeTruthy();
  });

  test('errors update as the user types after a failed attempt', () => {
    render(<App />);
    type('Email', 'not-an-email');
    next();
    expect(screen.getByText(/enter a valid email address/i)).toBeTruthy();
    type('Email', 'sam@example.com');
    expect(screen.queryByText(/enter a valid email address/i)).toBeNull();
  });

  test('a valid step advances and focuses the new heading', () => {
    render(<App />);
    completeAccount();
    expect(currentStep()).toMatch(/profile/i);
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: /step 2 of 3: profile/i }));
  });

  test('Back keeps values, and completed steps are clickable', () => {
    render(<App />);
    completeAccount();
    type('Full name', 'Sam');
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(field('Email').value).toBe('sam@example.com');
    next();
    expect(field('Full name').value).toBe('Sam');
    expect(screen.queryByRole('button', { name: /review/i })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /account \(completed\)/i }));
    expect(currentStep()).toMatch(/account/i);
  });

  test('review shows the data, Edit jumps back, and submit succeeds', async () => {
    const calls = [];
    const onSubmit = (values) => {
      calls.push(values);
      return new Promise((resolve) => setTimeout(resolve, 20));
    };
    render(<Wizard onSubmit={onSubmit} />);
    completeAccount();
    completeProfile();
    expect(currentStep()).toMatch(/review/i);
    expect(screen.getByText('sam@example.com')).toBeTruthy();
    expect(screen.getByText('Designer')).toBeTruthy();
    expect(screen.queryByText('correct-horse')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /edit profile/i }));
    expect(field('Full name').value).toBe('Sam Rivera');
    next();

    const submit = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submit);
    expect(submit.textContent).toMatch(/creating/i);
    fireEvent.click(submit);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual({
      email: 'sam@example.com',
      password: 'correct-horse',
      name: 'Sam Rivera',
      role: 'Designer',
      updates: false,
    });
    expect(await screen.findByText(/account created for sam@example.com/i)).toBeTruthy();
  });
});
