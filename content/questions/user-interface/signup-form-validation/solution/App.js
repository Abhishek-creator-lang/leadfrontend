import React, { useRef, useState } from 'react';
import './styles.css';

const FIELDS = ['username', 'email', 'password', 'confirm'];
const EMPTY = { username: '', email: '', password: '', confirm: '' };

export const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'letter', label: 'At least one letter', test: (p) => /[a-z]/i.test(p) },
  { id: 'number', label: 'At least one number', test: (p) => /\d/.test(p) },
];

// Pure and framework-free, so the server can run the same rules.
export function validate(values) {
  const errors = {};
  if (!/^\w{3,20}$/.test(values.username)) errors.username = 'Use 3–20 letters, numbers or underscores.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Enter a valid email address.';
  if (!PASSWORD_RULES.every((r) => r.test(values.password)))
    errors.password = 'Your password doesn’t meet all the requirements.';
  if (!values.confirm || values.confirm !== values.password) errors.confirm = 'Passwords don’t match.';
  return errors;
}

function errorProps(name, error) {
  return {
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${name}-error` : undefined,
  };
}

function ErrorText({ name, error }) {
  if (!error) return null;
  return (
    <p id={`${name}-error`} className="error">
      {error}
    </p>
  );
}

export default function App() {
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const formRef = useRef(null);

  // Errors are derived from values; `touched` decides which ones are visible.
  const allErrors = validate(values);
  const errors = Object.fromEntries(Object.entries(allErrors).filter(([field]) => touched[field]));

  const handleChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  const handleBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  function handleSubmit(event) {
    event.preventDefault();
    setTouched({ username: true, email: true, password: true, confirm: true });
    const firstInvalid = FIELDS.find((f) => allErrors[f]);
    if (firstInvalid) {
      formRef.current.elements.namedItem(firstInvalid).focus();
      return;
    }
    setSubmitted(values.username);
  }

  if (submitted) {
    return (
      <main className="signup">
        <h1>Create your account</h1>
        <p role="status">Welcome, {submitted}!</p>
      </main>
    );
  }

  const passwordDescribedBy = ['password-rules', errors.password && 'password-error'].filter(Boolean).join(' ');

  return (
    <main className="signup">
      <h1>Create your account</h1>
      <form ref={formRef} className="form" noValidate onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            value={values.username}
            onChange={handleChange}
            onBlur={handleBlur}
            {...errorProps('username', errors.username)}
          />
          <ErrorText name="username" error={errors.username} />
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            {...errorProps('email', errors.email)}
          />
          <ErrorText name="email" error={errors.email} />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <div className="password-row">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={passwordDescribedBy}
            />
            <button
              type="button"
              className="toggle"
              aria-pressed={showPassword}
              aria-controls="password"
              onClick={() => setShowPassword((s) => !s)}
            >
              Show password
            </button>
          </div>
          <ul id="password-rules" className="checklist">
            {PASSWORD_RULES.map((rule) => {
              const met = rule.test(values.password);
              return (
                <li key={rule.id} className={`rule${met ? ' rule--met' : ''}`} data-met={met}>
                  {rule.label}
                  <span className="visually-hidden">{met ? ' (met)' : ' (not met)'}</span>
                </li>
              );
            })}
          </ul>
          <ErrorText name="password" error={errors.password} />
        </div>

        <div className="field">
          <label htmlFor="confirm">Confirm password</label>
          <input
            id="confirm"
            name="confirm"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={values.confirm}
            onChange={handleChange}
            onBlur={handleBlur}
            {...errorProps('confirm', errors.confirm)}
          />
          <ErrorText name="confirm" error={errors.confirm} />
        </div>

        <button type="submit" className="primary">
          Create account
        </button>
      </form>
    </main>
  );
}
