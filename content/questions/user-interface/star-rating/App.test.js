import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App, { StarRating } from './App';

const radio = (name) => screen.getByRole('radio', { name });
const filledCount = (container) => container.querySelectorAll('.star--filled').length;

describe('StarRating', () => {
  test('renders five labelled radios inside a labelled group, not rated', () => {
    render(<App />);
    expect(screen.getAllByRole('radio')).toHaveLength(5);
    expect(screen.getByRole('group', { name: 'Rate this recipe' })).toBeTruthy();
    expect(radio('1 star')).toBeTruthy();
    expect(radio('5 stars')).toBeTruthy();
    expect(screen.getByText('Not rated')).toBeTruthy();
  });

  test('clicking a star sets the rating', () => {
    const { container } = render(<App />);
    fireEvent.click(radio('3 stars'));
    expect(radio('3 stars').checked).toBe(true);
    expect(screen.getByText('3 out of 5')).toBeTruthy();
    expect(filledCount(container)).toBe(3);
  });

  test('hover previews and leaving restores the value', () => {
    const { container } = render(<App />);
    fireEvent.click(radio('2 stars'));
    fireEvent.mouseEnter(radio('4 stars').closest('label'));
    expect(filledCount(container)).toBe(4);
    fireEvent.mouseLeave(container.querySelector('.stars'));
    expect(filledCount(container)).toBe(2);
  });

  test('clear resets and calls onChange', () => {
    const calls = [];
    render(<StarRating max={4} label="Score" onChange={(v) => calls.push(v)} />);
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    fireEvent.click(radio('4 stars'));
    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(calls).toEqual([4, 0]);
    expect(screen.getByText('Not rated')).toBeTruthy();
    expect(radio('4 stars').checked).toBe(false);
  });
});
