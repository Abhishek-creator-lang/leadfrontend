import React, { createContext, useContext } from 'react';
import './styles.css';

const ToastContext = createContext(null);

// TODO: hold toasts in state, expose show() via context, render polite/assertive regions,
// auto-dismiss with pause on hover/focus, cap at `max`, dismiss button.
export function ToastProvider({ children, duration = 5000, max = 3 }) {
  const value = { show: () => {} };
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  return useContext(ToastContext);
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
