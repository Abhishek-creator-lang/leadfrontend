import UndoHistory from './index';

describe('UndoHistory', () => {
  test('starts with the initial value and nothing to undo or redo', () => {
    const h = new UndoHistory('a');
    expect(h.present).toBe('a');
    expect(h.canUndo).toBe(false);
    expect(h.canRedo).toBe(false);
  });

  test('set records changes that can be undone in reverse order', () => {
    const h = new UndoHistory(0);
    h.set(1);
    h.set(2);
    h.set(3);
    expect(h.undo()).toBe(2);
    expect(h.undo()).toBe(1);
    expect(h.undo()).toBe(0);
    expect(h.canUndo).toBe(false);
  });

  test('redo replays undone changes', () => {
    const h = new UndoHistory(0);
    h.set(1);
    h.set(2);
    h.undo();
    h.undo();
    expect(h.canRedo).toBe(true);
    expect(h.redo()).toBe(1);
    expect(h.redo()).toBe(2);
    expect(h.canRedo).toBe(false);
  });

  test('a new change after undo clears the redo stack', () => {
    const h = new UndoHistory(0);
    h.set(1);
    h.set(2);
    h.undo();
    h.set(10);
    expect(h.canRedo).toBe(false);
    expect(h.redo()).toBe(10);
    expect(h.undo()).toBe(1);
  });

  test('setting the same value is a no-op and keeps redo', () => {
    const h = new UndoHistory(1);
    h.set(2);
    h.undo();
    h.set(1);
    expect(h.canRedo).toBe(true);
    expect(h.canUndo).toBe(false);
    const n = new UndoHistory(NaN);
    n.set(NaN);
    expect(n.canUndo).toBe(false);
  });

  test('undo and redo at the boundaries return the present', () => {
    const h = new UndoHistory('x');
    expect(h.undo()).toBe('x');
    expect(h.redo()).toBe('x');
    expect(h.present).toBe('x');
  });

  test('update applies a function to the present', () => {
    const counter = new UndoHistory(5);
    counter.update((n) => n + 1);
    counter.update((n) => n * 10);
    expect(counter.present).toBe(60);
    expect(counter.undo()).toBe(6);
  });

  test('limit bounds the number of undo steps, dropping the oldest', () => {
    const h = new UndoHistory(0, { limit: 2 });
    h.set(1);
    h.set(2);
    h.set(3);
    expect(h.undo()).toBe(2);
    expect(h.undo()).toBe(1);
    expect(h.canUndo).toBe(false);
    expect(h.redo()).toBe(2);
    expect(h.redo()).toBe(3);
  });

  test('reset clears both stacks', () => {
    const h = new UndoHistory(0);
    h.set(1);
    h.set(2);
    h.undo();
    h.reset(100);
    expect(h.present).toBe(100);
    expect(h.canUndo).toBe(false);
    expect(h.canRedo).toBe(false);
  });

  test('stores values by reference without cloning', () => {
    const a = { text: 'a' };
    const b = { text: 'b' };
    const h = new UndoHistory(a);
    h.set(b);
    expect(h.undo()).toBe(a);
    expect(h.redo()).toBe(b);
  });

  test('handles long sequences of interleaved operations', () => {
    const h = new UndoHistory(0);
    for (let i = 1; i <= 50; i++) h.set(i);
    for (let i = 0; i < 20; i++) h.undo();
    expect(h.present).toBe(30);
    for (let i = 0; i < 5; i++) h.redo();
    expect(h.present).toBe(35);
    h.set(-1);
    expect(h.undo()).toBe(35);
  });
});
