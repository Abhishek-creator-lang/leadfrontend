import React from 'react';
import './styles.css';

const post = {
  id: 'p1',
  author: { name: 'Priya Raman', handle: 'priya_builds', avatar: 'https://i.pravatar.cc/96?img=47' },
  createdAt: new Date(Date.now() - 1000 * 60 * 47).toISOString(),
  text: 'Shipped keyboard navigation for our data grid today.\nArrow keys, Home/End, Page Up/Down. Screen-reader tested with NVDA and VoiceOver.',
  counts: { replies: 18, reposts: 1204, likes: 15342 },
  liked: false,
};

// TODO: semantic markup, layout, relative time, compact counts, like toggle, accessible names.
export default function App() {
  return (
    <div>
      <img src={post.author.avatar} />
      <div>{post.author.name}</div>
      <div>@{post.author.handle}</div>
      <div>{post.createdAt}</div>
      <div>{post.text}</div>
      <div>
        <span>Reply {post.counts.replies}</span>
        <span>Repost {post.counts.reposts}</span>
        <span>Like {post.counts.likes}</span>
        <span>Share</span>
      </div>
    </div>
  );
}
