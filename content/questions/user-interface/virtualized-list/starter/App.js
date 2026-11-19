import React from 'react';
import './styles.css';

const ITEMS = Array.from({ length: 10000 }, (_, i) => ({ id: i + 1, label: `Item ${i + 1}` }));

// TODO: render only the visible rows (+ overscan) instead of all of them.
// Add aria-posinset / aria-setsize, a focusable scroll container, and "Jump to item".
export function VirtualList({ items, itemHeight, height, overscan = 3, renderItem, label }) {
  return (
    <div className="viewport" style={{ height }} role="list" aria-label={label}>
      {items.map((item, index) => (
        <div key={index} className="row" role="listitem" style={{ height: itemHeight }}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <main>
      <h1>10,000 rows</h1>
      <VirtualList
        items={ITEMS}
        itemHeight={30}
        height={300}
        label="Items"
        renderItem={(item) => item.label}
      />
    </main>
  );
}
