import React from 'react';
import './styles.css';

// Fake API: resolves after ~400ms.
export function sendMessage(data) {
  return new Promise((resolve) => setTimeout(() => resolve({ ok: true, data }), 400));
}

export default function App() {
  // TODO: field state, validation, error display, focus first invalid field, sending + success states.
  return (
    <main className="contact">
      <h1>Contact us</h1>
      <form className="form">
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" />
        </div>
        <div className="field">
          <label htmlFor="message">Message</label>
          <textarea id="message" name="message" rows={4} />
        </div>
        <button type="submit">Send message</button>
      </form>
    </main>
  );
}
