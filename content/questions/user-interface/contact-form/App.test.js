import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const field = (name) => screen.getByLabelText(name);
const type = (name, value) => fireEvent.change(field(name), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole('button', { name: /send message/i }));

describe('Contact form', () => {
  test('empty submit shows errors linked to fields and focuses the first one', () => {
    render(<App />);
    submit();
    ['Name', 'Email', 'Message'].forEach((label) => {
      const input = field(label);
      expect(input.getAttribute('aria-invalid')).toBe('true');
      const error = document.getElementById(input.getAttribute('aria-describedby'));
      expect(error.textContent.length > 0).toBe(true);
    });
    expect(document.activeElement).toBe(field('Name'));
  });

  test('focuses the first invalid field when earlier ones are valid', () => {
    render(<App />);
    type('Name', 'Ada');
    type('Email', 'not-an-email');
    type('Message', 'Hello there, friends!');
    submit();
    expect(field('Name').getAttribute('aria-invalid')).toBeNull();
    expect(field('Email').getAttribute('aria-invalid')).toBe('true');
    expect(document.activeElement).toBe(field('Email'));
  });

  test('errors clear as the user fixes them', () => {
    render(<App />);
    submit();
    type('Name', 'Ada');
    expect(field('Name').getAttribute('aria-invalid')).toBeNull();
  });

  test('valid submit shows a sending state, then a thank-you message', async () => {
    render(<App />);
    type('Name', 'Ada');
    type('Email', 'ada@example.com');
    type('Message', 'I would like a demo, please.');
    submit();
    const button = screen.getByRole('button', { name: /sending/i });
    expect(button.disabled).toBe(true);
    const status = await screen.findByRole('status', {}, { timeout: 2000 });
    expect(status.textContent).toMatch(/Thanks, Ada!/);
    expect(status.textContent).toMatch(/ada@example\.com/);
    fireEvent.click(screen.getByRole('button', { name: /send another/i }));
    expect(field('Name').value).toBe('');
  });
});
