import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import './styles.css';

const ToastContext = createContext(null);

const ICONS = { success: '✓', error: '!', info: 'i' };
let nextId = 1;

function Toast({ toast, duration, onDismiss }) {
  const [paused, setPaused] = useState(false);
  const remaining = useRef(duration);
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  // Runs while not paused. Cleanup subtracts the time that passed, so resuming continues the countdown.
  useEffect(() => {
    if (paused) return undefined;
    const startedAt = Date.now();
    const id = setTimeout(() => onDismissRef.current(toast.id), remaining.current);
    return () => {
      clearTimeout(id);
      remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt));
    };
  }, [paused, toast.id]);

  return (
    <li
      className={`toast toast--${toast.type}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
    >
      <span className="toast-icon" aria-hidden="true">
        {ICONS[toast.type]}
      </span>
      <p className="toast-message">{toast.message}</p>
      <button type="button" className="toast-dismiss" aria-label="Dismiss notification" onClick={() => onDismiss(toast.id)}>
        <span aria-hidden="true">×</span>
      </button>
    </li>
  );
}

export function ToastProvider({ children, duration = 5000, max = 3 }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  const show = useCallback(
    ({ type = 'info', message }) => {
      const id = nextId++;
      // Newest last; keep only the `max` most recent.
      setToasts((prev) => [...prev, { id, type, message }].slice(-max));
      return id;
    },
    [max]
  );

  // Stable value: consumers that only call show() don't re-render whenever a toast appears.
  const api = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  const renderList = (items) => (
    <ul className="toast-list">
      {items.map((t) => (
        <Toast key={t.id} toast={t} duration={duration} onDismiss={dismiss} />
      ))}
    </ul>
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <section className="toast-viewport" aria-label="Notifications">
        {/* Both regions are always mounted, so screen readers are already watching them. */}
        <div role="alert">{renderList(toasts.filter((t) => t.type === 'error'))}</div>
        <div role="status">{renderList(toasts.filter((t) => t.type !== 'error'))}</div>
      </section>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

function Demo() {
  const toast = useToast();
  return (
    <main className="demo">
      <h1>Toasts</h1>
      <div className="buttons">
        <button type="button" onClick={() => toast.show({ type: 'success', message: 'Changes saved.' })}>
          Show success
        </button>
        <button type="button" onClick={() => toast.show({ type: 'error', message: 'Couldn’t connect. Try again.' })}>
          Show error
        </button>
        <button type="button" onClick={() => toast.show({ type: 'info', message: 'A new version is available.' })}>
          Show info
        </button>
      </div>
    </main>
  );
}

export default function App({ toastDuration = 5000 }) {
  return (
    <ToastProvider duration={toastDuration}>
      <Demo />
    </ToastProvider>
  );
}
