Build a toast notification system that any component can trigger.

```jsx
<ToastProvider duration={5000} max={3}>
  <App />
</ToastProvider>

// anywhere inside:
const toast = useToast();
toast.show({ type: 'success', message: 'Changes saved.' });
```

## Requirements

1. `ToastProvider` renders a toast stack in the bottom-right corner and exposes `show({ type, message })` through context. `type` is `success`, `error` or `info`, each with its own colour and icon.
2. Each toast has a **Dismiss** button. Its accessible name is "Dismiss notification".
3. **Auto-dismiss** after `duration` ms (default 5000). The timer **pauses while the toast is hovered or has keyboard focus** and resumes with the time that was left.
4. At most `max` toasts (default 3) are visible. Showing another one drops the **oldest**.
5. **Announcements:**
   - success and info are announced politely (`role="status"`)
   - errors are announced assertively (`role="alert"`).

   The live-region containers must exist **before** any toast is added.
6. Toasts don't steal focus.
7. Demo: three buttons ("Show success", "Show error", "Show info"). `App` accepts a `toastDuration` prop that it passes to the provider.

## Follow-up

- Why does `useToast` return a **stable** object, and why does that matter?
- Is an auto-dismissing error message acceptable? What do the WCAG timing rules say?
- How would you trigger toasts from outside React (an axios interceptor)?
