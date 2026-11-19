import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './styles.css';

export function Modal({ open, onClose, title, initialFocusRef, children }) {
  const titleId = useId();
  const bodyId = useId();
  const dialogRef = useRef(null);
  const pointerDownOnBackdrop = useRef(false);

  // Keep the latest onClose without re-running the open/close effect when the parent re-renders.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return undefined;

    // Remember who had focus, move focus in, lock scroll.
    const previouslyFocused = document.activeElement;
    (initialFocusRef?.current ?? dialogRef.current)?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      // Restore focus, but only if the element is still in the document.
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) previouslyFocused.focus();
    };
  }, [open, initialFocusRef]);

  if (!open) return null;

  return createPortal(
    <div
      className="modal-backdrop"
      // Close only when the press *starts and ends* on the backdrop, so dragging a text selection
      // out of the dialog doesn't dismiss it.
      onMouseDown={(e) => {
        pointerDownOnBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (pointerDownOnBackdrop.current && e.target === e.currentTarget) onClose();
        pointerDownOnBackdrop.current = false;
      }}
    >
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        tabIndex={-1}
      >
        <h2 id={titleId}>{title}</h2>
        <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
          <span aria-hidden="true">×</span>
        </button>
        <div id={bodyId}>{children}</div>
      </div>
    </div>,
    document.body
  );
}

export default function App() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const cancelRef = useRef(null);

  const close = () => setOpen(false);

  return (
    <main className="page">
      <h1>Files</h1>
      <p>report.pdf · 2.4 MB</p>
      <button type="button" className="danger" onClick={() => setOpen(true)}>
        Delete file
      </button>
      <p role="status">{message}</p>

      <Modal open={open} onClose={close} title="Delete file?" initialFocusRef={cancelRef}>
        <p>report.pdf will be permanently deleted. This can’t be undone.</p>
        <div className="modal-actions">
          <button type="button" ref={cancelRef} onClick={close}>
            Cancel
          </button>
          <button
            type="button"
            className="danger"
            onClick={() => {
              setMessage('report.pdf was deleted.');
              close();
            }}
          >
            Delete
          </button>
        </div>
      </Modal>
    </main>
  );
}
