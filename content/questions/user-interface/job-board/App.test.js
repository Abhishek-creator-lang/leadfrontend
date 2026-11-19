import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { mockOptions } from './api';

beforeEach(() => {
  mockOptions.delay = 10;
  mockOptions.failIds = false;
  mockOptions.failItems = false;
});

const articles = () => screen.queryAllByRole('article');
const loadMore = () => screen.findByRole('button', { name: /load more jobs/i });

describe('Job board', () => {
  test('shows a loading message, then the first 6 jobs', async () => {
    render(<App />);
    expect(screen.getByText(/loading jobs/i)).toBeTruthy();
    await waitFor(() => expect(articles()).toHaveLength(6));
    expect(screen.queryByText(/loading jobs/i)).toBeNull();
    expect(articles()[0].textContent).toMatch(/Lumen/);
    expect(articles()[0].textContent).toMatch(/By lumen/);
  });

  test('titles link out only when the job has a url', async () => {
    render(<App />);
    await waitFor(() => expect(articles()).toHaveLength(6));
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(4);
    expect(links[0].getAttribute('target')).toBe('_blank');
    expect(links[0].textContent).toMatch(/new tab/i);
    expect(articles()[2].querySelector('a')).toBeNull();
  });

  test('Load more appends pages and disappears at the end', async () => {
    render(<App />);
    fireEvent.click(await loadMore());
    await waitFor(() => expect(articles()).toHaveLength(12));
    expect(screen.getByRole('status').textContent).toMatch(/loaded 6 more jobs/i);
    fireEvent.click(await loadMore());
    await waitFor(() => expect(articles()).toHaveLength(15));
    expect(screen.queryByRole('button', { name: /load more/i })).toBeNull();
  });

  test('the button is unavailable while loading and double clicks do not duplicate', async () => {
    render(<App />);
    const button = await loadMore();
    fireEvent.click(button);
    expect(button.textContent).toMatch(/loading/i);
    expect(button.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(button);
    await waitFor(() => expect(articles()).toHaveLength(12));
    await new Promise((r) => setTimeout(r, 80));
    expect(articles()).toHaveLength(12);
  });

  test('shows an error and retries the failed step', async () => {
    mockOptions.failIds = true;
    render(<App />);
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(/went wrong/i);
    mockOptions.failIds = false;
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    await waitFor(() => expect(articles()).toHaveLength(6));
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
