import React, { useState } from 'react';
import './styles.css';

// Fake API: resolves after ~300ms with { ok: true }, or rejects when `fail` is true.
export function likeApi(action, { fail = false } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fail) reject(new Error(`Could not ${action} the post. Please try again.`));
      else resolve({ ok: true, action });
    }, 300);
  });
}

export default function App() {
  const [shouldFail, setShouldFail] = useState(false);

  // TODO: track liked, count, pending and error state.
  // TODO: call likeApi on click and handle success/failure.

  return (
    <main className="post">
      <p>Just shipped a new accessible component library! 🎉</p>

      <button type="button" className="like-button">
        <span className="like-icon">♡</span>
        Like · 42
      </button>

      <label className="fail-toggle">
        <input type="checkbox" checked={shouldFail} onChange={(e) => setShouldFail(e.target.checked)} />
        Simulate network error
      </label>
    </main>
  );
}
