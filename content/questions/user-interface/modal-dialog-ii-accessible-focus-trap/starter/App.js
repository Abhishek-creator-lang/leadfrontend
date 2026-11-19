import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './styles.css';

export function Modal({ open, onClose, title, initialFocusRef, children }) {
  const titleId = useId();
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    (initialFocusRef?.current ?? dialogRef.current)?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) previouslyFocused.focus();
    };
  }, [open, initialFocusRef]);

  // TODO: trap Tab / Shift+Tab inside the dialog, pull stray focus back in,
  // make the rest of <body> inert while open (and restore it exactly), default initial focus.

  if (!open) return null;
  return createPortal(
    <div className="modal-backdrop">
      <div ref={dialogRef} className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
          <span aria-hidden="true">×</span>
        </button>
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </div>,
    document.body
  );
}

export default function App() {
  const [profile, setProfile] = useState({ name: 'Grace Hopper', email: 'grace@example.com' });
  const [open, setOpen] = useState(false);
  const nameRef = useRef(null);

  function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setProfile({ name: data.get('name'), email: data.get('email') });
    setOpen(false);
  }

  return (
    <main className="page">
      <h1>Profile</h1>
      <p className="profile">
        {profile.name} · {profile.email}
      </p>
      <button type="button" onClick={() => setOpen(true)}>
        Edit profile
      </button>
      <a href="#help">Help</a>

      <Modal open={open} onClose={() => setOpen(false)} title="Edit profile" initialFocusRef={nameRef}>
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Name
            <input ref={nameRef} name="name" defaultValue={profile.name} />
          </label>
          <label>
            Email
            <input name="email" type="email" defaultValue={profile.email} />
          </label>
          <div className="modal-actions">
            <button type="button" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="primary">
              Save
            </button>
          </div>
        </form>
      </Modal>
    </main>
  );
}
