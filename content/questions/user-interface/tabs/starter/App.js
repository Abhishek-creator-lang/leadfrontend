import React from 'react';
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

// TODO: track the selected tab, show only its panel and add the tab ARIA roles.
export function Tabs({ items, defaultValue }) {
  return (
    <div className="tabs">
      <div className="tabs-list">
        {items.map((item) => (
          <button key={item.value} type="button" className="tabs-tab">
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item) => (
        <div key={item.value} className="tabs-panel">
          {item.panel}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  return <Tabs items={ITEMS} />;
}
