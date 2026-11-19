import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { fetchPosts } from './api';
import './styles.css';

const PAGE_SIZE = 10;

/**
 * Owns the paging state. Refs hold what async code needs *right now* (cursor, the in-flight
 * request) without re-creating `loadMore` on every change.
 */
function useFeed(pageSize) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading'); // 'idle' | 'loading' | 'error' | 'done'
  const [announcement, setAnnouncement] = useState('');
  const cursorRef = useRef(null);
  const doneRef = useRef(false);
  const controllerRef = useRef(null); // non-null ⇔ a request is in flight

  const loadMore = useCallback(async () => {
    // Synchronous guard. State would be stale between two quick calls, but a ref isn't.
    if (controllerRef.current || doneRef.current) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus('loading');
    try {
      const page = await fetchPosts({ cursor: cursorRef.current, limit: pageSize, signal: controller.signal });
      cursorRef.current = page.nextCursor;
      doneRef.current = page.nextCursor === null;
      setItems((prev) => [...prev, ...page.items]);
      setStatus(doneRef.current ? 'done' : 'idle');
      setAnnouncement(`Loaded ${page.items.length} more posts`);
    } catch (error) {
      if (error.name === 'AbortError') return; // unmounted; nothing to update
      setStatus('error');
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }, [pageSize]);

  useEffect(() => {
    loadMore();
    return () => {
      controllerRef.current?.abort();
      controllerRef.current = null;
    };
  }, [loadMore]);

  return { items, status, announcement, loadMore };
}

export default function App() {
  const { items, status, announcement, loadMore } = useFeed(PAGE_SIZE);
  const sentinelRef = useRef(null);
  const baseId = useId();

  // Auto-load when the sentinel is within 300px of the viewport. Re-subscribes per status so a
  // sentinel that stays visible after a short page triggers the next load too.
  useEffect(() => {
    if (status !== 'idle' || typeof IntersectionObserver === 'undefined') return undefined;
    const node = sentinelRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore();
      },
      { rootMargin: '300px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [status, loadMore]);

  // APG feed keyboard model: Page Down / Page Up move between articles.
  function onFeedKeyDown(event) {
    if (event.key !== 'PageDown' && event.key !== 'PageUp') return;
    const article = event.target.closest('article');
    if (!article) return;
    const sibling = event.key === 'PageDown' ? article.nextElementSibling : article.previousElementSibling;
    if (sibling && sibling.tagName === 'ARTICLE') {
      event.preventDefault();
      sibling.focus();
    }
  }

  const setSize = status === 'done' ? items.length : -1;

  return (
    <main className="page">
      <h1>Team feed</h1>

      <div role="feed" aria-busy={status === 'loading'} aria-label="Team posts" className="feed" onKeyDown={onFeedKeyDown}>
        {items.map((post, index) => {
          const titleId = `${baseId}-${post.id}`;
          return (
            <article
              key={post.id}
              className="post"
              tabIndex={0}
              aria-labelledby={titleId}
              aria-posinset={index + 1}
              aria-setsize={setSize}
            >
              <h2 id={titleId}>{post.title}</h2>
              <p className="author">{post.author}</p>
              <p>{post.body}</p>
            </article>
          );
        })}
      </div>

      <div ref={sentinelRef} className="sentinel" aria-hidden="true" />

      <footer className="feed-footer">
        {status === 'loading' && (
          <p className="loading">
            <span className="spinner" aria-hidden="true" /> Loading posts…
          </p>
        )}
        {status === 'error' && (
          <div role="alert" className="error">
            <p>Couldn't load posts.</p>
            <button type="button" onClick={loadMore}>
              Retry
            </button>
          </div>
        )}
        {status === 'idle' && (
          <button type="button" className="load-more" onClick={loadMore}>
            Load more
          </button>
        )}
        {status === 'done' && <p className="end">You're all caught up</p>}
      </footer>

      <p role="status" className="sr-only">
        {announcement}
      </p>
    </main>
  );
}
