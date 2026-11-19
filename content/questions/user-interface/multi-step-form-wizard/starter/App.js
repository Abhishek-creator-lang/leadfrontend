import React from 'react';
import './styles.css';

export const STEPS = ['Account', 'Profile', 'Review'];
export const ROLES = ['Engineer', 'Designer', 'Manager'];

// TODO:
// - keep all values in one place so Back never loses data
// - per-step validation, errors with aria-invalid / aria-describedby, focus first invalid field
// - progress indicator with aria-current="step"; completed steps clickable
// - focus the step heading on step change; Review with Edit buttons; async submit
export function Wizard({ onSubmit }) {
  return (
    <div className="wizard">
      <ol className="steps">
        {STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <form className="step">
        <h2>Account</h2>
        <label>
          Email
          <input type="email" />
        </label>
        <label>
          Password
          <input type="password" />
        </label>
        <div className="nav">
          <button type="submit">Next</button>
        </div>
      </form>
    </div>
  );
}

const fakeSubmit = (values) => new Promise((resolve) => setTimeout(() => resolve({ id: 1 }), 300));

export default function App() {
  return (
    <main>
      <h1>Create your account</h1>
      <Wizard onSubmit={fakeSubmit} />
    </main>
  );
}
