import React, { useEffect, useId, useRef, useState } from 'react';
import './styles.css';

export const STEPS = ['Account', 'Profile', 'Review'];
export const ROLES = ['Engineer', 'Designer', 'Manager'];

const INITIAL_VALUES = { email: '', password: '', name: '', role: '', updates: false };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Field order per step: also the order used to find the "first invalid field".
const STEP_FIELDS = [['email', 'password'], ['name', 'role'], []];

/** Pure validation: returns { field: message } for the given step. */
export function validateStep(step, values) {
  const errors = {};
  if (step === 0) {
    if (!values.email.trim()) errors.email = 'Email is required';
    else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Enter a valid email address';
    if (!values.password) errors.password = 'Password is required';
    else if (values.password.length < 8) errors.password = 'Password must be at least 8 characters';
  }
  if (step === 1) {
    if (!values.name.trim()) errors.name = 'Full name is required';
    if (!values.role) errors.role = 'Choose a role';
  }
  return errors;
}

function Field({ id, label, error, children }) {
  const errorId = `${id}-error`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': error ? errorId : undefined })}
      {error && (
        <p id={errorId} className="error">
          {error}
        </p>
      )}
    </div>
  );
}

export function Wizard({ onSubmit }) {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [step, setStep] = useState(0);
  const [attempted, setAttempted] = useState(() => new Set()); // steps where Next was pressed
  const [submit, setSubmit] = useState({ status: 'idle', error: null }); // idle | pending | done | error
  const headingRef = useRef(null);
  const isFirstRender = useRef(true);
  const mounted = useRef(true);
  const uid = useId();
  const fieldId = (name) => `${uid}-${name}`;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Move focus to the new step's heading, but not on first load (don't steal focus from the page).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  // Errors are derived from values; they're only *shown* once the user has tried to continue.
  const errors = attempted.has(step) ? validateStep(step, values) : {};

  const set = (name) => (event) => {
    const { type, checked, value } = event.target;
    setValues((v) => ({ ...v, [name]: type === 'checkbox' ? checked : value }));
  };

  function next(event) {
    event.preventDefault();
    const stepErrors = validateStep(step, values);
    const firstInvalid = STEP_FIELDS[step].find((name) => stepErrors[name]);
    if (firstInvalid) {
      setAttempted((prev) => new Set(prev).add(step));
      document.getElementById(fieldId(firstInvalid))?.focus();
      return;
    }
    setStep((s) => s + 1);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submit.status === 'pending') return;
    setSubmit({ status: 'pending', error: null });
    try {
      await onSubmit({ ...values, email: values.email.trim(), name: values.name.trim() });
      if (mounted.current) setSubmit({ status: 'done', error: null });
    } catch {
      if (mounted.current) setSubmit({ status: 'error', error: 'Something went wrong. Please try again.' });
    }
  }

  if (submit.status === 'done') {
    return (
      <div className="wizard done" role="status">
        <h2>Account created for {values.email.trim()}</h2>
        <p>Check your inbox to verify your address.</p>
      </div>
    );
  }

  const heading = (
    <h2 ref={headingRef} tabIndex={-1}>
      <span className="step-count">
        Step {step + 1} of {STEPS.length}:
      </span>{' '}
      {STEPS[step]}
    </h2>
  );

  return (
    <div className="wizard">
      <nav aria-label="Sign-up progress">
        <ol className="steps">
          {STEPS.map((label, index) => {
            const state = index < step ? 'complete' : index === step ? 'current' : 'upcoming';
            return (
              <li key={label} className={`step-item step-item--${state}`} aria-current={state === 'current' ? 'step' : undefined}>
                {state === 'complete' ? (
                  <button type="button" className="step-link" onClick={() => setStep(index)}>
                    {label}
                    <span className="sr-only"> (completed)</span>
                  </button>
                ) : (
                  <span>{label}</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {step === 0 && (
        <form className="step" onSubmit={next} noValidate aria-labelledby={`${uid}-h`}>
          <div id={`${uid}-h`}>{heading}</div>
          <Field id={fieldId('email')} label="Email" error={errors.email}>
            {(props) => <input {...props} type="email" autoComplete="email" value={values.email} onChange={set('email')} />}
          </Field>
          <Field id={fieldId('password')} label="Password" error={errors.password}>
            {(props) => (
              <input {...props} type="password" autoComplete="new-password" value={values.password} onChange={set('password')} />
            )}
          </Field>
          <div className="nav">
            <span />
            <button type="submit" className="primary">
              Next
            </button>
          </div>
        </form>
      )}

      {step === 1 && (
        <form className="step" onSubmit={next} noValidate aria-labelledby={`${uid}-h`}>
          <div id={`${uid}-h`}>{heading}</div>
          <Field id={fieldId('name')} label="Full name" error={errors.name}>
            {(props) => <input {...props} autoComplete="name" value={values.name} onChange={set('name')} />}
          </Field>
          <Field id={fieldId('role')} label="Role" error={errors.role}>
            {(props) => (
              <select {...props} value={values.role} onChange={set('role')}>
                <option value="">Select a role…</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <label className="checkbox">
            <input type="checkbox" checked={values.updates} onChange={set('updates')} />
            Send me product updates
          </label>
          <div className="nav">
            <button type="button" onClick={() => setStep(0)}>
              Back
            </button>
            <button type="submit" className="primary">
              Next
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form className="step" onSubmit={handleSubmit} aria-labelledby={`${uid}-h`}>
          <div id={`${uid}-h`}>{heading}</div>
          <section className="review" aria-label="Account">
            <div className="review-head">
              <h3>Account</h3>
              <button type="button" className="link" onClick={() => setStep(0)}>
                Edit<span className="sr-only"> account</span>
              </button>
            </div>
            <dl>
              <dt>Email</dt>
              <dd>{values.email.trim()}</dd>
              <dt>Password</dt>
              <dd aria-label="Password hidden">{'•'.repeat(8)}</dd>
            </dl>
          </section>
          <section className="review" aria-label="Profile">
            <div className="review-head">
              <h3>Profile</h3>
              <button type="button" className="link" onClick={() => setStep(1)}>
                Edit<span className="sr-only"> profile</span>
              </button>
            </div>
            <dl>
              <dt>Full name</dt>
              <dd>{values.name.trim()}</dd>
              <dt>Role</dt>
              <dd>{values.role}</dd>
              <dt>Product updates</dt>
              <dd>{values.updates ? 'Yes' : 'No'}</dd>
            </dl>
          </section>
          {submit.status === 'error' && (
            <p role="alert" className="error">
              {submit.error}
            </p>
          )}
          <div className="nav">
            <button type="button" onClick={() => setStep(1)}>
              Back
            </button>
            <button type="submit" className="primary" aria-disabled={submit.status === 'pending'}>
              {submit.status === 'pending' ? 'Creating…' : 'Create account'}
            </button>
          </div>
        </form>
      )}
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
