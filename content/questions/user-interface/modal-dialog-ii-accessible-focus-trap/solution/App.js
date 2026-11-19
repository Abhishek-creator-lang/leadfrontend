import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './styles.css';

const FOCUSABLE = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',');

export function getFocusable(root) {
  return Array.from(root.querySelectorAll(FOCUSABLE)).filter(
    (el) => el.tabIndex >= 0 && !el.hidden && !el.closest('[hidden],[inert]')
  );
}

// Make every other child of <body> inert; return an undo function that only touches what we changed.
function inertSiblings(keep) {
  const changed = [];
  for (const el of Array.from(document.body.children)) {
    if (el === keep || el.hasAttribute('inert') || el.tagName === 'SCRIPT') continue;
    el.setAttribute('inert', '');
    changed.push(el);
  }
  return () => changed.forEach((el) => el.removeAttribute('inert'));
}

export function Modal({ open, onClose, title, initialFocusRef, children }) {
  const titleId = useId();
  const dialogRef = useRef(null);
  const [container] = useState(() => document.createElement('div'));
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Layout effect: the background becomes inert and focus moves before the browser paints.
  useLayoutEffect(() => {
    if (!open) return undefined;
    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement;

    document.body.appendChild(container);
    const undoInert = inertSiblings(container);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    (initialFocusRef?.current ?? getFocusable(dialog)[0] ?? dialog).focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = getFocusable(dialog);
      if (items.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    // Safety net: if focus ends up outside (programmatic focus, browser UI), bring it back.
    const onFocusIn = (event) => {
      if (!dialog.contains(event.target)) (getFocusable(dialog)[0] ?? dialog).focus();
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('focusin', onFocusIn);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('focusin', onFocusIn);
      document.body.style.overflow = overflow;
      undoInert();
      container.remove();
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) previouslyFocused.focus();
    };
  }, [open, initialFocusRef, container]);

  if (!open) return null;

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={dialogRef} className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
          <span aria-hidden="true">×</span>
        </button>
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </div>,
    container
  );
}

export default function App() {
  const [profile, setProfile] = useState({ name: 'Grace Hopper', email: 'grace@example.com' });
  const [open, setOpen] = useState(false);
  const nameRef = useRef(null);

  function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setProfile({ name: String(data.get('name')).trim(), email: String(data.get('email')).trim() });
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
            <input ref={nameRef} name="name" defaultValue={profile.name} autoComplete="name" />
          </label>
          <label>
            Email
            <input name="email" type="email" defaultValue={profile.email} autoComplete="email" />
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
