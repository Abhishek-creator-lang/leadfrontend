import React, { useId, useState } from 'react';
import './styles.css';

const ITEMS = [
  { value: 'inbox', label: 'Inbox', panel: 'You have 3 unread messages from your team.' },
  { value: 'drafts', label: 'Drafts', panel: 'Two drafts saved: "Q3 roadmap" and "Offsite agenda".' },
  { value: 'archived', label: 'Archived', panel: 'Archived conversations are kept for 12 months.', disabled: true },
  { value: 'sent', label: 'Sent', panel: 'Last sent: "Re: design review" at 4:12 PM.' },
];

// TODO: roving tabindex, arrow/Home/End navigation, automatic vs manual activation, disabled tabs.
export function Tabs({ items, label, activation = 'automatic' }) {
  const [selected, setSelected] = useState(items[0].value);
  const baseId = useId();

  return (
    <div className="tabs">
      <div role="tablist" aria-label={label} className="tabs-list">
        {items.map((item) => (
          <button
            key={item.value}
            id={`${baseId}-tab-${item.value}`}
            type="button"
            role="tab"
            className="tabs-tab"
            aria-selected={item.value === selected}
            aria-controls={`${baseId}-panel-${item.value}`}
            onClick={() => setSelected(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item) => (
        <div
          key={item.value}
          id={`${baseId}-panel-${item.value}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${item.value}`}
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
  return <Tabs items={ITEMS} label="Mailbox folders" />;
}
