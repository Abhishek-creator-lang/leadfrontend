import React from 'react';
import './styles.css';

// TODO: semantic landmarks, CSS Grid layout, sticky footer, responsive stacking, skip link.
export default function App() {
  return (
    <div>
      <div>Header</div>
      <div>
        <a href="#">Home</a> · <a href="#">Docs</a> · <a href="#">Blog</a>
      </div>
      <div>
        <h1>Main content</h1>
        <p>The main column takes up all the remaining width.</p>
      </div>
      <div>Sidebar</div>
      <div>Footer</div>
    </div>
  );
}
