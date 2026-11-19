import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';

const wait = (ms) => act(() => new Promise((r) => setTimeout(r, ms)));
const timeEl = (container) => container.querySelector('time');
const toSeconds = (hms) => {
  const [h, m, s] = hms.split(':').map(Number);
  return h * 3600 + m * 60 + s;
};

describe('Digital clock', () => {
  test('renders the current time as HH:MM:SS in a <time> element', () => {
    const { container } = render(<App />);
    const el = timeEl(container);
    expect(el).toBeTruthy();
    expect(el.textContent).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    expect(el.getAttribute('dateTime')).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    const d = new Date();
    const nowSecs = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
    const diff = Math.abs(nowSecs - toSeconds(el.textContent));
    expect(diff <= 2 || diff >= 86398).toBe(true);
  });

  test('toggles to 12-hour format', () => {
    const { container } = render(<App />);
    const toggle = screen.getByRole('button', { name: '24-hour' });
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    expect(timeEl(container).textContent).toMatch(/^(1[0-2]|[1-9]):\d{2}:\d{2} (AM|PM)$/);
  });

  test('ticks every second', async () => {
    const { container } = render(<App />);
    const first = timeEl(container).textContent;
    await wait(1100);
    expect(timeEl(container).textContent === first).toBe(false);
  });
});
