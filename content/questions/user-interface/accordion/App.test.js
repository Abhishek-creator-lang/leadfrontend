import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const header = (name) => screen.getByRole('button', { name: new RegExp(name, 'i') });

describe('Accordion', () => {
  test('all sections start collapsed', () => {
    render(<App />);
    ['HTML', 'CSS', 'JavaScript'].forEach((t) => {
      expect(header(`^${t}$`).getAttribute('aria-expanded')).toBe('false');
    });
    expect(screen.queryAllByRole('region')).toHaveLength(0);
  });

  test('clicking a header expands and collapses it', () => {
    render(<App />);
    fireEvent.click(header('^HTML$'));
    expect(header('^HTML$').getAttribute('aria-expanded')).toBe('true');
    expect(screen.getAllByRole('region')).toHaveLength(1);
    fireEvent.click(header('^HTML$'));
    expect(header('^HTML$').getAttribute('aria-expanded')).toBe('false');
  });

  test('multiple sections can be open at once', () => {
    render(<App />);
    fireEvent.click(header('^HTML$'));
    fireEvent.click(header('^CSS$'));
    expect(screen.getAllByRole('region')).toHaveLength(2);
  });

  test('header controls its panel and panel is labelled by header', () => {
    render(<App />);
    const btn = header('^CSS$');
    fireEvent.click(btn);
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    expect(panel).toBeTruthy();
    expect(panel.getAttribute('aria-labelledby')).toBe(btn.id);
  });

  test('arrow keys, Home and End move focus between headers', () => {
    render(<App />);
    header('^HTML$').focus();
    fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(header('^CSS$'));
    fireEvent.keyDown(document.activeElement, { key: 'End' });
    expect(document.activeElement).toBe(header('^JavaScript$'));
    fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(header('^HTML$'));
    fireEvent.keyDown(document.activeElement, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(header('^JavaScript$'));
    fireEvent.keyDown(document.activeElement, { key: 'Home' });
    expect(document.activeElement).toBe(header('^HTML$'));
  });
});
