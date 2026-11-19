import React from 'react';
import './styles.css';

// TODO: touched + errors state, validate on blur and submit, password checklist,
// confirm-password cross check, show-password toggle, success state.
export default function App() {
  return (
    <main className="signup">
      <h1>Create your account</h1>
      <form className="form">
        <div className="field">
          <label htmlFor="username">Username</label>
          <input id="username" name="username" />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" />
        </div>
        <div className="field">
          <label htmlFor="confirm">Confirm password</label>
          <input id="confirm" name="confirm" type="password" />
        </div>
        <button type="submit" className="primary">
          Create account
        </button>
      </form>
    </main>
  );
}
