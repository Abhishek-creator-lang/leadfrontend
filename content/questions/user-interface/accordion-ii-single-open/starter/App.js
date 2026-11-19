import React from 'react';
import './styles.css';

const FAQ = [
  { value: 'shipping', title: 'How long does shipping take?', contents: 'Orders ship within 2 business days and arrive in 3–5 days.' },
  { value: 'returns', title: 'Can I return an item?', contents: 'Yes, unused items can be returned within 30 days for a full refund.' },
  { value: 'warranty', title: 'Is there a warranty?', contents: 'Every product has a 2-year limited warranty covering defects.' },
];

// TODO: only one section open at a time, `collapsible`, controlled + uncontrolled API, a11y, keyboard.
export function Accordion({ items, value, defaultValue, onValueChange, collapsible = true }) {
  return (
    <div className="accordion">
      {items.map((item) => (
        <div className="accordion-item" key={item.value}>
          <h3 className="accordion-heading">
            <button type="button" className="accordion-trigger">
              {item.title}
            </button>
          </h3>
          <div className="accordion-panel">{item.contents}</div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  // TODO: control the accordion from here and show which section is open.
  return (
    <main>
      <h2>FAQ</h2>
      <Accordion items={FAQ} />
      <p className="status">Open section: none</p>
    </main>
  );
}
