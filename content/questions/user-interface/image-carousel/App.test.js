import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const currentAlt = () => {
  const imgs = screen.getAllByRole('img');
  expect(imgs).toHaveLength(1);
  return imgs[0].getAttribute('alt');
};

describe('ImageCarousel', () => {
  test('starts on the first image with a "1 of 5" slide label', () => {
    render(<App />);
    expect(currentAlt()).toMatch(/river/i);
    expect(screen.getByRole('group', { name: '1 of 5' })).toBeTruthy();
  });

  test('next and previous move between images and wrap around', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Next image' }));
    expect(currentAlt()).toMatch(/canyon/i);
    fireEvent.click(screen.getByRole('button', { name: 'Previous image' }));
    fireEvent.click(screen.getByRole('button', { name: 'Previous image' }));
    expect(currentAlt()).toMatch(/northern lights/i);
    expect(screen.getByRole('group', { name: '5 of 5' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Next image' }));
    expect(currentAlt()).toMatch(/river/i);
  });

  test('dot buttons jump to an image and mark it current', () => {
    render(<App />);
    const dot = screen.getByRole('button', { name: 'Show image 3' });
    fireEvent.click(dot);
    expect(currentAlt()).toMatch(/snow/i);
    expect(dot.getAttribute('aria-current')).toBe('true');
    expect(screen.getByRole('button', { name: 'Show image 1' }).getAttribute('aria-current')).toBeNull();
  });

  test('arrow keys navigate when focus is inside the carousel', () => {
    render(<App />);
    const next = screen.getByRole('button', { name: 'Next image' });
    next.focus();
    fireEvent.keyDown(next, { key: 'ArrowRight' });
    fireEvent.keyDown(next, { key: 'ArrowRight' });
    expect(currentAlt()).toMatch(/snow/i);
    fireEvent.keyDown(next, { key: 'ArrowLeft' });
    expect(currentAlt()).toMatch(/canyon/i);
  });

  test('carousel exposes its role description', () => {
    const { container } = render(<App />);
    const section = container.querySelector('section');
    expect(section.getAttribute('aria-roledescription')).toBe('carousel');
    expect(section.getAttribute('aria-label')).toBeTruthy();
  });
});
