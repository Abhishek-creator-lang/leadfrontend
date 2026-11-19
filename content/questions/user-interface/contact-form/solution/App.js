import React, { useRef, useState } from 'react';
import './styles.css';

// Fake API: resolves after ~400ms.
export function sendMessage(data) {
  return new Promise((resolve) => setTimeout(() => resolve({ ok: true, data }), 400));
}

const EMPTY = { name: '', email: '', message: '' };
const FIELDS = ['name', 'email', 'message'];

export function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Please enter your name.';
  if (!values.email.trim()) errors.email = 'Please enter your email address.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = 'Enter an email address like name@example.com.';
  if (values.message.trim().length < 10) errors.message = 'Your message needs at least 10 characters.';
  return errors;
}

function Field({ id, label, error, as: Tag = 'input', ...props }) {
  const errorId = `${id}-error`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <Tag id={id} name={id} aria-invalid={error ? true : undefined} aria-describedby={error ? errorId : undefined} {...props} />
      {error && (
        <p id={errorId} className="error">
          {error}
        </p>
      )}
    </div>
  );
}

export default function App() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent
  const [sentTo, setSentTo] = useState(null);
  const formRef = useRef(null);

  function handleChange(event) {
    const { name, value } = event.target;
    const next = { ...values, [name]: value };
    setValues(next);
    // Only re-validate fields that already show an error: don't nag while the user is still typing.
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: validate(next)[name] }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (status === 'sending') return;
    const found = validate(values);
    setErrors(found);
    const firstInvalid = FIELDS.find((f) => found[f]);
    if (firstInvalid) {
      formRef.current.elements.namedItem(firstInvalid).focus();
      return;
    }
    setStatus('sending');
    await sendMessage({ ...values, name: values.name.trim(), email: values.email.trim() });
    setSentTo({ name: values.name.trim(), email: values.email.trim() });
    setStatus('sent');
  }

  function reset() {
    setValues(EMPTY);
    setErrors({});
    setStatus('idle');
  }

  if (status === 'sent') {
    return (
      <main className="contact">
        <h1>Contact us</h1>
        <div className="success" role="status">
          <p>
            Thanks, {sentTo.name}! We'll reply to {sentTo.email} soon.
          </p>
          <button type="button" onClick={reset}>
            Send another message
          </button>
        </div>
      </main>
    );
  }

  const sending = status === 'sending';

  return (
    <main className="contact">
      <h1>Contact us</h1>
      <form ref={formRef} className="form" noValidate onSubmit={handleSubmit}>
        <Field id="name" label="Name" autoComplete="name" value={values.name} onChange={handleChange} error={errors.name} />
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
        />
        <Field
          id="message"
          label="Message"
          as="textarea"
          rows={4}
          value={values.message}
          onChange={handleChange}
          error={errors.message}
        />
        <button type="submit" disabled={sending}>
          {sending ? 'Sending…' : 'Send message'}
        </button>
      </form>
    </main>
  );
}
