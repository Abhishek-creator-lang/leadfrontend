import React, { useState } from 'react';
import { fetchPosts } from './api';
import './styles.css';

// TODO:
// - load the first page on mount (fetchPosts({ cursor, limit: 10, signal }))
// - load the next page when a sentinel becomes visible (IntersectionObserver) or via "Load more"
// - one request at a time, abort on unmount, error + Retry, end-of-feed message
// - role="feed", aria-busy, articles with aria-posinset / aria-setsize, PageUp / PageDown
export default function App() {
  const [posts] = useState([]);

  return (
    <main className="page">
      <h1>Team feed</h1>
      <div className="feed">
        {posts.map((post) => (
          <article key={post.id} className="post">
            <h2>{post.title}</h2>
            <p>{post.body}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
