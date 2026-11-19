import React, { cloneElement, useEffect, useId, useRef, useState } from 'react';
import './styles.css';

const HOVER_DELAY = 300;

export function Tooltip({ content, children }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const timer = useRef(null);

  const clear = () => clearTimeout(timer.current);
  const show = () => {
    clear();
    setOpen(true);
  };
  const showLater = () => {
    clear();
    timer.current = setTimeout(() => setOpen(true), HOVER_DELAY);
  };
  const hide = () => {
    clear();
    setOpen(false);
  };

  useEffect(() => clear, []); // never leave a pending timer behind

  // Escape dismisses without moving focus (WCAG 1.4.13 "dismissible").
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') hide();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    // Hover handlers live on the wrapper, which contains the tooltip, so hovering the tooltip keeps it open.
    <span className="tooltip-wrapper" onMouseEnter={showLater} onMouseLeave={hide}>
      {cloneElement(children, {
        'aria-describedby': id,
        onFocus: (e) => {
          children.props.onFocus?.(e);
          show();
        },
        onBlur: (e) => {
          children.props.onBlur?.(e);
          hide();
        },
      })}
      {/* Always rendered so aria-describedby resolves; `hidden` controls visibility. */}
      <span id={id} role="tooltip" className="tooltip" hidden={!open}>
        {content}
      </span>
    </span>
  );
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

export function Popover({ label, trigger, children }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const headingId = useId();
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const panel = panelRef.current;
    (panel.querySelector(FOCUSABLE) ?? panel).focus();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    // pointerdown/mousedown fires before focus moves, and before a click on another control acts.
    const onPointerDown = (e) => {
      if (!panel.contains(e.target) && !triggerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [open]);

  return (
    <span className="popover-wrapper">
      <button
        ref={triggerRef}
        type="button"
        className="tool"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        {trigger}
      </button>
      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-labelledby={headingId}
        className="popover"
        tabIndex={-1}
        hidden={!open}
      >
        <h2 id={headingId}>{label}</h2>
        {children}
      </div>
    </span>
  );
}

export default function App() {
  return (
    <main>
      <div className="toolbar" aria-label="Formatting" role="group">
        <Tooltip content="Bold (Ctrl+B)">
          <button type="button" className="tool" aria-label="Bold">
            <strong>B</strong>
          </button>
        </Tooltip>
        <Tooltip content="Italic (Ctrl+I)">
          <button type="button" className="tool" aria-label="Italic">
            <em>I</em>
          </button>
        </Tooltip>
        <Popover label="Text settings" trigger="Settings">
          <label>
            <input type="checkbox" defaultChecked /> Spell check
          </label>
          <label>
            <input type="checkbox" /> Smart quotes
          </label>
        </Popover>
      </div>
      <p>Click outside the popover to close it.</p>
    </main>
  );
}
