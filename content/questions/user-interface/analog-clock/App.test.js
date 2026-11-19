import React from 'react';
import { render, screen } from '@testing-library/react';
import App, { AnalogClock } from './App';

const rotation = (el) => Number(/rotate\(([-\d.]+)/.exec(el.getAttribute('transform') || '')?.[1]);

describe('Analog clock', () => {
  test('is a single image named with the current time', () => {
    render(<App />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('aria-label')).toMatch(/^Current time \d{1,2}:\d{2}\s?(AM|PM)$/);
  });

  test('has twelve hour ticks', () => {
    const { container } = render(<App />);
    expect(container.querySelectorAll('.tick')).toHaveLength(12);
  });

  test('hands are rotated consistently with the current time', () => {
    const { container } = render(<AnalogClock size={200} />);
    const d = new Date();
    const minute = rotation(container.querySelector('.hand--minute'));
    const hour = rotation(container.querySelector('.hand--hour'));
    const expectedMinute = (d.getMinutes() + d.getSeconds() / 60) * 6;
    expect(Math.abs(minute - expectedMinute) < 1.5 || Math.abs(minute - expectedMinute) > 358).toBe(true);
    // The hour hand sits between the whole hours: hour angle = 30·h + minute angle / 12.
    const expectedHour = (d.getHours() % 12) * 30 + minute / 12;
    expect(Math.abs(hour - expectedHour) < 1 || Math.abs(hour - expectedHour) > 359).toBe(true);
  });

  test('respects the size prop', () => {
    render(<AnalogClock size={120} />);
    expect(screen.getByRole('img').getAttribute('width')).toBe('120');
  });
});
