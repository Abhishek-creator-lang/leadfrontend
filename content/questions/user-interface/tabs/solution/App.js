import React, { useId, useState } from 'react';
import './styles.css';

const ITEMS = [
  {
    value: 'overview',
    label: 'Overview',
    panel: 'A quick tour of the product: what it does, who it is for and how to get started in five minutes.',
  },
  {
    value: 'pricing',
    label: 'Pricing',
    panel: 'Free for personal projects. Teams pay per seat, billed monthly or yearly with a 20% discount.',
  },
  {
    value: 'faq',
    label: 'FAQ',
    panel: 'Can I cancel any time? Yes. Do you offer refunds? Within 30 days, no questions asked.',
  },
];

export function Tabs({ items, defaultValue, label = 'Sections' }) {
  const [selected, setSelected] = useState(defaultValue ?? items[0]?.value);
  const baseId = useId();
  const tabId = (value) => `${baseId}-tab-${value}`;
  const panelId = (value) => `${baseId}-panel-${value}`;

  return (
    <div className="tabs">
      <div role="tablist" aria-label={label} className="tabs-list">
        {items.map((item) => {
          const isSelected = item.value === selected;
          return (
            <button
              key={item.value}
              id={tabId(item.value)}
              type="button"
              role="tab"
              className="tabs-tab"
              aria-selected={isSelected}
              aria-controls={panelId(item.value)}
              onClick={() => setSelected(item.value)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.value}
          id={panelId(item.value)}
          role="tabpanel"
          aria-labelledby={tabId(item.value)}
          className="tabs-panel"
          hidden={item.value !== selected}
          tabIndex={0}
        >
          {item.panel}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  return <Tabs items={ITEMS} label="Product information" />;
}
