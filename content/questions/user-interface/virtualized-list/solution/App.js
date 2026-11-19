import React, { forwardRef, memo, useCallback, useId, useImperativeHandle, useRef, useState } from 'react';
import './styles.css';

const ITEMS = Array.from({ length: 10000 }, (_, i) => ({ id: i + 1, label: `Item ${i + 1}` }));

/** Pure window maths, easy to unit-test. Returns [start, end) indices to render. */
export function getRange({ scrollTop, height, itemHeight, count, overscan }) {
  const first = Math.floor(scrollTop / itemHeight);
  const visible = Math.ceil(height / itemHeight);
  const start = Math.max(0, first - overscan);
  const end = Math.min(count, first + visible + overscan);
  return [start, end];
}

// Memoised: while scrolling, rows that stay in the window keep the same props and don't re-render.
const Row = memo(function Row({ item, index, top, height, count, renderItem }) {
  return (
    <div
      role="listitem"
      className="row"
      aria-posinset={index + 1}
      aria-setsize={count}
      style={{ transform: `translateY(${top}px)`, height }}
    >
      {renderItem(item, index)}
    </div>
  );
});

export const VirtualList = forwardRef(function VirtualList(
  { items, itemHeight, height, overscan = 3, renderItem, label },
  ref
) {
  const [scrollTop, setScrollTop] = useState(0);
  const viewportRef = useRef(null);

  // Imperative API for parents: scroll a given index to the top of the viewport.
  useImperativeHandle(
    ref,
    () => ({
      scrollToIndex(index) {
        const top = Math.max(0, Math.min(index, items.length - 1)) * itemHeight;
        if (viewportRef.current) viewportRef.current.scrollTop = top;
        // Also set state: assigning the same scrollTop fires no scroll event.
        setScrollTop(top);
      },
    }),
    [items.length, itemHeight]
  );
  const count = items.length;
  const [start, end] = getRange({ scrollTop, height, itemHeight, count, overscan });

  // Reading scrollTop from the event target is cheap. No getBoundingClientRect, so no forced layout.
  const onScroll = (event) => setScrollTop(event.currentTarget.scrollTop);

  const rows = [];
  for (let index = start; index < end; index++) {
    rows.push(
      <Row
        key={items[index].id ?? index}
        item={items[index]}
        index={index}
        top={index * itemHeight}
        height={itemHeight}
        count={count}
        renderItem={renderItem}
      />
    );
  }

  return (
    <div
      ref={viewportRef}
      className="viewport"
      style={{ height }}
      role="list"
      aria-label={label}
      tabIndex={0}
      onScroll={onScroll}
    >
      {/* The spacer gives the scrollbar the full content height. */}
      <div className="spacer" style={{ height: count * itemHeight }}>
        {rows}
      </div>
    </div>
  );
});

export default function App() {
  const listRef = useRef(null);
  const inputId = useId();
  const [target, setTarget] = useState('');
  const itemHeight = 30;

  // Stable identity so memoised rows aren't invalidated on every App render.
  const renderItem = useCallback((item) => item.label, []);

  function jump(event) {
    event.preventDefault();
    const n = Number(target) || 1;
    listRef.current?.scrollToIndex(n - 1);
  }

  return (
    <main>
      <h1>10,000 rows</h1>
      <form className="jump" onSubmit={jump}>
        <label htmlFor={inputId}>Jump to item</label>
        <input
          id={inputId}
          type="number"
          min={1}
          max={ITEMS.length}
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />
        <button type="submit">Go</button>
      </form>
      <VirtualList
        ref={listRef}
        items={ITEMS}
        itemHeight={itemHeight}
        height={300}
        overscan={3}
        label="Items"
        renderItem={renderItem}
      />
    </main>
  );
}
