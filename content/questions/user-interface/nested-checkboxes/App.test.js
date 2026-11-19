import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const box = (name) => screen.getByRole('checkbox', { name });

describe('CheckboxTree', () => {
  test('checking a group checks all of its descendants', () => {
    render(<App />);
    fireEvent.click(box('Projects'));
    ['Create projects', 'Members', 'Invite members', 'Remove members'].forEach((n) => {
      expect(box(n).checked).toBe(true);
    });
    expect(box('Billing').checked).toBe(false);
    fireEvent.click(box('Projects'));
    expect(box('Invite members').checked).toBe(false);
  });

  test('a partially checked group is indeterminate, fully checked group is checked', () => {
    render(<App />);
    fireEvent.click(box('View invoices'));
    expect(box('Billing').checked).toBe(false);
    expect(box('Billing').indeterminate).toBe(true);
    fireEvent.click(box('Pay invoices'));
    expect(box('Billing').checked).toBe(true);
    expect(box('Billing').indeterminate).toBe(false);
  });

  test('state propagates through several levels', () => {
    render(<App />);
    fireEvent.click(box('Invite members'));
    expect(box('Members').indeterminate).toBe(true);
    expect(box('Projects').indeterminate).toBe(true);
    fireEvent.click(box('Remove members'));
    expect(box('Members').checked).toBe(true);
    expect(box('Projects').indeterminate).toBe(true);
    fireEvent.click(box('Create projects'));
    expect(box('Projects').checked).toBe(true);
  });

  test('clicking an indeterminate group checks everything under it', () => {
    render(<App />);
    fireEvent.click(box('Pay invoices'));
    fireEvent.click(box('Billing'));
    expect(box('View invoices').checked).toBe(true);
    expect(box('Pay invoices').checked).toBe(true);
  });

  test('summary counts selected leaves', () => {
    render(<App />);
    expect(screen.getByText('0 of 6 permissions selected')).toBeTruthy();
    fireEvent.click(box('Projects'));
    fireEvent.click(box('View audit log'));
    expect(screen.getByText('4 of 6 permissions selected')).toBeTruthy();
  });
});
