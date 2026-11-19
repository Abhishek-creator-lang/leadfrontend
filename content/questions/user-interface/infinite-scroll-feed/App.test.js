import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { mockOptions } from './api';

beforeEach(() => {
  mockOptions.delay = 10;
  mockOptions.failRate = 0;
});

const loadMoreButton = () => screen.findByRole('button', { name: /load more/i });

describe('Infinite scroll feed', () => {
  test('loads the first page into a feed of articles', async () => {
    render(<App />);
    const feed = screen.getByRole('feed');
    expect(feed.getAttribute('aria-busy')).toBe('true');
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(10));
    expect(feed.getAttribute('aria-busy')).toBe('false');
    const first = screen.getAllByRole('article')[0];
    expect(first.getAttribute('aria-posinset')).toBe('1');
    expect(first.getAttribute('aria-setsize')).toBe('-1');
  });

  test('Load more appends the next page', async () => {
    render(<App />);
    fireEvent.click(await loadMoreButton());
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(20));
    expect(screen.getByRole('status').textContent).toMatch(/loaded 10 more posts/i);
  });

  test('double-clicking Load more does not duplicate posts', async () => {
    render(<App />);
    const button = await loadMoreButton();
    fireEvent.click(button);
    fireEvent.click(button);
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(20));
    await new Promise((r) => setTimeout(r, 60));
    expect(screen.getAllByRole('article')).toHaveLength(20);
  });

  test('stops at the end of the feed', async () => {
    render(<App />);
    for (let i = 0; i < 3; i++) fireEvent.click(await loadMoreButton());
    await screen.findByText(/you're all caught up/i);
    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(34);
    expect(articles[33].getAttribute('aria-setsize')).toBe('34');
    expect(screen.queryByRole('button', { name: /load more/i })).toBeNull();
  });

  test('shows an error with Retry that recovers', async () => {
    mockOptions.failRate = 1;
    render(<App />);
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(/couldn't load/i);
    mockOptions.failRate = 0;
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(10));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  test('Page Down / Page Up move focus between articles', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(10));
    const articles = screen.getAllByRole('article');
    articles[0].focus();
    fireEvent.keyDown(articles[0], { key: 'PageDown' });
    expect(document.activeElement).toBe(articles[1]);
    fireEvent.keyDown(articles[1], { key: 'PageUp' });
    expect(document.activeElement).toBe(articles[0]);
  });
});
