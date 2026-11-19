import React, { useId, useRef, useState } from 'react';
import './styles.css';

const FAQ = [
  { value: 'shipping', title: 'How long does shipping take?', contents: 'Orders ship within 2 business days and arrive in 3–5 days.' },
  { value: 'returns', title: 'Can I return an item?', contents: 'Yes, unused items can be returned within 30 days for a full refund.' },
  { value: 'warranty', title: 'Is there a warranty?', contents: 'Every product has a 2-year limited warranty covering defects.' },
];

// Controlled when `value` is provided, uncontrolled otherwise.
function useControllableState(value, defaultValue, onChange) {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;
  const setValue = (next) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };
  return [current, setValue];
}

export function Accordion({ items, value, defaultValue = null, onValueChange, collapsible = true }) {
  const [openValue, setOpenValue] = useControllableState(value, defaultValue, onValueChange);
  const baseId = useId();
  const triggers = useRef([]);

  const toggle = (itemValue) => {
    if (itemValue === openValue) {
      if (collapsible) setOpenValue(null);
    } else {
      setOpenValue(itemValue);
    }
  };

  const onKeyDown = (event, index) => {
    const last = items.length - 1;
    const target = {
      ArrowDown: index === last ? 0 : index + 1,
      ArrowUp: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    triggers.current[target]?.focus();
  };

  return (
    <div className="accordion">
      {items.map((item, index) => {
        const isOpen = item.value === openValue;
        const triggerId = `${baseId}-trigger-${item.value}`;
        const panelId = `${baseId}-panel-${item.value}`;
        return (
          <div className="accordion-item" key={item.value}>
            <h3 className="accordion-heading">
              <button
                ref={(el) => (triggers.current[index] = el)}
                id={triggerId}
                type="button"
                className="accordion-trigger"
                aria-expanded={isOpen}
                aria-controls={panelId}
                aria-disabled={isOpen && !collapsible ? true : undefined}
                onClick={() => toggle(item.value)}
                onKeyDown={(e) => onKeyDown(e, index)}
              >
                {item.title}
                <span className="chevron" aria-hidden="true" />
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={triggerId} className="accordion-panel" hidden={!isOpen}>
              {item.contents}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const [open, setOpen] = useState(null);
  const openTitle = FAQ.find((f) => f.value === open)?.title;

  return (
    <main>
      <h2>FAQ</h2>
      <Accordion items={FAQ} value={open} onValueChange={setOpen} />
      <p className="status">Open section: {openTitle ?? 'none'}</p>
    </main>
  );
}
