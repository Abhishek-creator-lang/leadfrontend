import React, { useEffect, useId, useRef, useState } from 'react';
import './styles.css';

export function MenuButton({ label, items }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const itemRefs = useRef([]);
  const id = useId();
  const buttonId = `${id}-button`;
  const menuId = `${id}-menu`;

  // Focus follows activeIndex while open. Items use tabIndex=-1: focus is managed, not tabbed.
  useEffect(() => {
    if (open && activeIndex >= 0) itemRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

  // Outside click closes without stealing focus back (the user clicked somewhere else on purpose).
  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [open]);

  function openAt(index) {
    setOpen(true);
    setActiveIndex(index);
  }

  function close({ restoreFocus = true } = {}) {
    setOpen(false);
    setActiveIndex(-1);
    if (restoreFocus) buttonRef.current?.focus();
  }

  function activate(index) {
    const item = items[index];
    if (!item || item.disabled) return;
    close();
    item.onSelect?.();
  }

  function onButtonKeyDown(event) {
    switch (event.key) {
      case 'ArrowDown':
      case 'Enter':
      case ' ':
        event.preventDefault(); // stop Space/Enter from also firing a click that toggles it shut
        openAt(0);
        break;
      case 'ArrowUp':
        event.preventDefault();
        openAt(items.length - 1);
        break;
      default:
    }
  }

  function typeahead(char) {
    const lower = char.toLowerCase();
    for (let step = 1; step <= items.length; step++) {
      const index = (activeIndex + step) % items.length;
      if (items[index].label.toLowerCase().startsWith(lower)) return index;
    }
    return -1;
  }

  function onMenuKeyDown(event) {
    const last = items.length - 1;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((i) => (i >= last ? 0 : i + 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((i) => (i <= 0 ? last : i - 1));
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(last);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        activate(activeIndex);
        break;
      case 'Escape':
        event.preventDefault();
        close();
        break;
      case 'Tab':
        // Put focus back on the button *before* the browser handles Tab, so Tab continues
        // from the button to the next element on the page. No preventDefault.
        close();
        break;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          const index = typeahead(event.key);
          if (index !== -1) setActiveIndex(index);
        }
    }
  }

  return (
    <div className="menu-root" ref={rootRef}>
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        className="menu-button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => (open ? close({ restoreFocus: false }) : openAt(0))}
        onKeyDown={onButtonKeyDown}
      >
        {label} <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <ul id={menuId} role="menu" aria-labelledby={buttonId} className="menu" onKeyDown={onMenuKeyDown}>
          {items.map((item, index) => (
            <li
              key={item.id}
              ref={(el) => (itemRefs.current[index] = el)}
              role="menuitem"
              tabIndex={-1}
              aria-disabled={item.disabled || undefined}
              className="menu-item"
              onClick={() => activate(index)}
              onMouseMove={() => {
                if (activeIndex !== index) setActiveIndex(index);
              }}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function App() {
  const [last, setLast] = useState('none');
  const items = [
    { id: 'edit', label: 'Edit', onSelect: () => setLast('Edit') },
    { id: 'duplicate', label: 'Duplicate', onSelect: () => setLast('Duplicate') },
    { id: 'archive', label: 'Archive', onSelect: () => setLast('Archive'), disabled: true },
    { id: 'delete', label: 'Delete', onSelect: () => setLast('Delete') },
  ];

  return (
    <main className="page">
      <MenuButton label="Actions" items={items} />
      <p className="last" role="status">
        Last action: {last}
      </p>
    </main>
  );
}
