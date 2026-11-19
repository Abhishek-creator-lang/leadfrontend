import React, { useEffect, useRef, useState } from 'react';
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

export function LikeButton({ initialLiked = false, initialCount = 0, shouldFail = false }) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  // Guard against setting state after unmount (the fake API can't be aborted).
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function handleClick() {
    if (pending) return;
    const action = liked ? 'unlike' : 'like';
    setPending(true);
    setError(null);
    try {
      await likeApi(action, { fail: shouldFail });
      if (!mounted.current) return;
      setLiked(action === 'like');
      setCount((c) => c + (action === 'like' ? 1 : -1));
    } catch (err) {
      if (mounted.current) setError(err.message);
    } finally {
      if (mounted.current) setPending(false);
    }
  }

  return (
    <div className="like">
      <button
        type="button"
        className="like-button"
        aria-pressed={liked}
        aria-busy={pending}
        disabled={pending}
        onClick={handleClick}
      >
        {pending ? (
          <span className="spinner" aria-hidden="true" />
        ) : (
          <span className="like-icon" aria-hidden="true">
            {liked ? '♥' : '♡'}
          </span>
        )}
        {liked ? 'Liked' : 'Like'} · {count}
      </button>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function App() {
  const [shouldFail, setShouldFail] = useState(false);

  return (
    <main className="post">
      <p>Just shipped a new accessible component library! 🎉</p>

      <LikeButton initialCount={42} shouldFail={shouldFail} />

      <label className="fail-toggle">
        <input type="checkbox" checked={shouldFail} onChange={(e) => setShouldFail(e.target.checked)} />
        Simulate network error
      </label>
    </main>
  );
}
