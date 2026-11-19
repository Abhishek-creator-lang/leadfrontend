import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const rows = () => screen.getAllByRole('listitem');
const list = () => screen.getByRole('list', { name: 'Items' });

function scrollTo(el, top) {
  // jsdom has no layout, so set scrollTop explicitly before firing the event.
  Object.defineProperty(el, 'scrollTop', { value: top, writable: true, configurable: true });
  fireEvent.scroll(el);
}

describe('VirtualList', () => {
  test('renders only the visible rows plus overscan', () => {
    render(<App />);
    expect(rows()).toHaveLength(13);
    expect(rows()[0].textContent).toBe('Item 1');
    expect(rows()[12].textContent).toBe('Item 13');
  });

  test('rows report their position in the full set', () => {
    render(<App />);
    expect(rows()[0].getAttribute('aria-posinset')).toBe('1');
    expect(rows()[0].getAttribute('aria-setsize')).toBe('10000');
  });

  test('the spacer has the full content height and the viewport is focusable', () => {
    render(<App />);
    expect(list().firstChild.style.height).toBe('300000px');
    expect(list().tabIndex).toBe(0);
  });

  test('scrolling moves the rendered window', () => {
    render(<App />);
    scrollTo(list(), 3000); // row index 100 is at the top
    const r = rows();
    expect(r).toHaveLength(16);
    expect(r[0].textContent).toBe('Item 98');
    expect(r[r.length - 1].textContent).toBe('Item 113');
    expect(r[0].getAttribute('aria-posinset')).toBe('98');
  });

  test('the window is clamped at the end of the list', () => {
    render(<App />);
    scrollTo(list(), 299700);
    const r = rows();
    expect(r[r.length - 1].textContent).toBe('Item 10000');
  });

  test('Jump to item scrolls the row into view', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('Jump to item'), { target: { value: '5000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(rows().some((r) => r.textContent === 'Item 5000')).toBe(true);
    expect(rows().some((r) => r.textContent === 'Item 1')).toBe(false);
  });
});
