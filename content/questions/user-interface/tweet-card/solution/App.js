import React, { useId, useState } from 'react';
import './styles.css';

const post = {
  id: 'p1',
  author: { name: 'Priya Raman', handle: 'priya_builds', avatar: 'https://i.pravatar.cc/96?img=47' },
  createdAt: new Date(Date.now() - 1000 * 60 * 47).toISOString(),
  text: 'Shipped keyboard navigation for our data grid today.\nArrow keys, Home/End, Page Up/Down. Screen-reader tested with NVDA and VoiceOver.',
  counts: { replies: 18, reposts: 1204, likes: 15342 },
  liked: false,
};

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const full = new Intl.NumberFormat('en-US');
const absolute = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' });
const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

export function relativeTime(iso, now = Date.now()) {
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 7 * 86400) return `${Math.floor(seconds / 86400)}d`;
  return shortDate.format(new Date(iso));
}

const plural = (n, one, many) => `${full.format(n)} ${n === 1 ? one : many}`;

// Simple inline SVG icons; decorative, so hidden from assistive tech.
const ICONS = {
  reply: 'M4 5h16v10H8l-4 4V5z',
  repost: 'M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z',
  like: 'M12 21s-7-4.5-9.3-9A5 5 0 0 1 12 6a5 5 0 0 1 9.3 6c-2.3 4.5-9.3 9-9.3 9z',
  share: 'M12 3l4 4h-3v8h-2V7H8l4-4zM5 13h2v6h10v-6h2v8H5v-8z',
};

function Icon({ name, filled }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" className="icon">
      <path
        d={ICONS[name]}
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.8}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ActionButton({ icon, label, count, pressed, onClick, className = '' }) {
  return (
    <button type="button" className={`action ${className}`} aria-label={label} aria-pressed={pressed} onClick={onClick}>
      <Icon name={icon} filled={pressed} />
      {count !== undefined && <span aria-hidden="true">{compact.format(count)}</span>}
    </button>
  );
}

export function PostCard({ post }) {
  const nameId = useId();
  const [liked, setLiked] = useState(post.liked);
  const likes = post.counts.likes - (post.liked ? 1 : 0) + (liked ? 1 : 0);

  return (
    <article className="card" aria-labelledby={nameId}>
      <img className="avatar" src={post.author.avatar} alt="" width="48" height="48" loading="lazy" />
      <div className="body">
        <header className="meta">
          <span id={nameId} className="name">
            {post.author.name}
          </span>
          <span className="handle">@{post.author.handle}</span>
          <span aria-hidden="true">·</span>
          <time className="time" dateTime={post.createdAt} title={absolute.format(new Date(post.createdAt))}>
            {relativeTime(post.createdAt)}
          </time>
        </header>

        <p className="text">{post.text}</p>

        <footer className="actions">
          <ActionButton icon="reply" label={`Reply, ${plural(post.counts.replies, 'reply', 'replies')}`} count={post.counts.replies} />
          <ActionButton icon="repost" label={`Repost, ${plural(post.counts.reposts, 'repost', 'reposts')}`} count={post.counts.reposts} />
          <ActionButton
            icon="like"
            className="action--like"
            label={`Like, ${plural(likes, 'like', 'likes')}`}
            count={likes}
            pressed={liked}
            onClick={() => setLiked((l) => !l)}
          />
          <ActionButton icon="share" label="Share" />
        </footer>
      </div>
    </article>
  );
}

export default function App() {
  return <PostCard post={post} />;
}
