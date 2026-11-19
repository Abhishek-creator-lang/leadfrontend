import React from 'react';
import './styles.css';

// TODO: show on focus (instant) and hover (300ms delay), hide on blur/leave/Escape,
// keep open while hovering the tooltip, role="tooltip" + aria-describedby.
export function Tooltip({ content, children }) {
  return <span className="tooltip-wrapper">{children}</span>;
}

// TODO: toggle a role="dialog" panel with aria-expanded/aria-controls, focus management,
// Escape (return focus) and outside-click dismissal.
export function Popover({ label, trigger, children }) {
  return (
    <span className="popover-wrapper">
      <button type="button" className="tool">
        {trigger}
      </button>
    </span>
  );
}

export default function App() {
  return (
    <main>
      <div className="toolbar" role="group" aria-label="Formatting">
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
