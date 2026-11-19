import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

const likeButton = () => screen.getByRole('button', { name: /like/i });

describe('LikeButton', () => {
  test('starts unliked with 42 likes', () => {
    render(<App />);
    expect(likeButton().getAttribute('aria-pressed')).toBe('false');
    expect(likeButton().textContent).toMatch(/42/);
  });

  test('is busy and disabled while the request is pending, then becomes liked', async () => {
    render(<App />);
    fireEvent.click(likeButton());
    expect(likeButton().disabled).toBe(true);
    expect(likeButton().getAttribute('aria-busy')).toBe('true');

    await waitFor(() => expect(likeButton().getAttribute('aria-pressed')).toBe('true'), { timeout: 2000 });
    expect(likeButton().disabled).toBe(false);
    expect(likeButton().textContent).toMatch(/Liked/);
    expect(likeButton().textContent).toMatch(/43/);
  });

  test('clicking again unlikes', async () => {
    render(<App />);
    fireEvent.click(likeButton());
    await waitFor(() => expect(likeButton().getAttribute('aria-pressed')).toBe('true'), { timeout: 2000 });
    fireEvent.click(likeButton());
    await waitFor(() => expect(likeButton().getAttribute('aria-pressed')).toBe('false'), { timeout: 2000 });
    expect(likeButton().textContent).toMatch(/42/);
  });

  test('shows an alert and keeps state when the request fails', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('checkbox', { name: /simulate network error/i }));
    fireEvent.click(likeButton());
    const alert = await screen.findByRole('alert', {}, { timeout: 2000 });
    expect(alert.textContent.length > 0).toBe(true);
    expect(likeButton().getAttribute('aria-pressed')).toBe('false');
    expect(likeButton().textContent).toMatch(/42/);
    expect(likeButton().disabled).toBe(false);
  });
});
