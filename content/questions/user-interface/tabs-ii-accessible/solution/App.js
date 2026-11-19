import React, { useId, useRef, useState } from 'react';
import './styles.css';

const ITEMS = [
  { value: 'inbox', label: 'Inbox', panel: 'You have 3 unread messages from your team.' },
  { value: 'drafts', label: 'Drafts', panel: 'Two drafts saved: "Q3 roadmap" and "Offsite agenda".' },
  { value: 'archived', label: 'Archived', panel: 'Archived conversations are kept for 12 months.', disabled: true },
  { value: 'sent', label: 'Sent', panel: 'Last sent: "Re: design review" at 4:12 PM.' },
];

export function Tabs({ items, label, activation = 'automatic', defaultValue }) {
  const firstEnabled = items.find((i) => !i.disabled)?.value;
  const [selected, setSelected] = useState(defaultValue ?? firstEnabled);
  const baseId = useId();
  const tabRefs = useRef(new Map());

  const enabled = items.filter((i) => !i.disabled);

  const focusTab = (value) => {
    tabRefs.current.get(value)?.focus();
    if (activation === 'automatic') setSelected(value);
  };

  const onKeyDown = (event, value) => {
    const index = enabled.findIndex((i) => i.value === value);
    const last = enabled.length - 1;
    let next;
    switch (event.key) {
      case 'ArrowRight':
        next = enabled[index === last ? 0 : index + 1];
        break;
      case 'ArrowLeft':
        next = enabled[index <= 0 ? last : index - 1];
        break;
      case 'Home':
        next = enabled[0];
        break;
      case 'End':
        next = enabled[last];
        break;
      default:
        return; // Enter/Space fall through to the native button click.
    }
    event.preventDefault();
    if (next) focusTab(next.value);
  };

  return (
    <div className="tabs">
      <div role="tablist" aria-label={label} aria-orientation="horizontal" className="tabs-list">
        {items.map((item) => {
          const isSelected = item.value === selected;
          return (
            <button
              key={item.value}
              ref={(el) => {
                if (el) tabRefs.current.set(item.value, el);
                else tabRefs.current.delete(item.value);
              }}
              id={`${baseId}-tab-${item.value}`}
              type="button"
              role="tab"
              className="tabs-tab"
              aria-selected={isSelected}
              aria-controls={`${baseId}-panel-${item.value}`}
              tabIndex={isSelected ? 0 : -1}
              disabled={item.disabled}
              onClick={() => setSelected(item.value)}
              onKeyDown={(e) => onKeyDown(e, item.value)}
            >
              {item.label}
            </button>
          );
        })}
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
