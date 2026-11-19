import React from 'react';
import './styles.css';

export default function App() {
  return (
    <div className="page">
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      <header className="page-header">
        <strong>Acme Docs</strong>
      </header>

      <nav className="page-nav" aria-label="Primary">
        <ul>
          <li>
            <a href="#main" aria-current="page">
              Getting started
            </a>
          </li>
          <li>
            <a href="#main">Components</a>
          </li>
          <li>
            <a href="#main">Changelog</a>
          </li>
        </ul>
      </nav>

      <main id="main" className="page-main" tabIndex={-1}>
        <h1>Getting started</h1>
        <p>
          The main column takes all the remaining width. It shrinks safely thanks to <code>minmax(0, 1fr)</code>, even
          with a long unbroken string like https://example.com/a/really/long/path/that/would/otherwise/overflow.
        </p>
        <p>Resize the preview below 720px to see the columns stack.</p>
      </main>

      <aside className="page-aside" aria-label="On this page">
        <h2>On this page</h2>
        <ul>
          <li>Install</li>
          <li>Configure</li>
        </ul>
      </aside>

      <footer className="page-footer">© 2026 Acme</footer>
    </div>
  );
}
