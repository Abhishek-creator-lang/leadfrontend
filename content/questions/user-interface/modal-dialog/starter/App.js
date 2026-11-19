import React, { useState } from 'react';
import './styles.css';

// TODO: portal, dialog semantics, initial focus, focus restore, Escape/backdrop/close button, scroll lock.
export function Modal({ open, onClose, title, initialFocusRef, children }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <main className="page">
      <h1>Files</h1>
      <p>report.pdf · 2.4 MB</p>
      <button type="button" className="danger" onClick={() => setOpen(true)}>
        Delete file
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Delete file?">
        <p>report.pdf will be permanently deleted. This can’t be undone.</p>
        <div className="modal-actions">
          <button type="button">Cancel</button>
          <button type="button" className="danger">
            Delete
          </button>
        </div>
      </Modal>
    </main>
  );
}
