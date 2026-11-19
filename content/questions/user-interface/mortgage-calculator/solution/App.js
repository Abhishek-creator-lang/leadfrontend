import React, { useState } from 'react';
import './styles.css';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function monthlyPayment(principal, annualRatePercent, years) {
  const n = years * 12;
  const r = annualRatePercent / 100 / 12;
  if (r === 0) return principal / n;
  const growth = Math.pow(1 + r, n);
  return (principal * r * growth) / (growth - 1);
}

const isNumber = (s) => /^\s*\d+(\.\d+)?\s*$/.test(s);

function validate({ amount, rate, years }) {
  const errors = {};
  if (!isNumber(amount) || Number(amount) <= 0) errors.amount = 'Enter a loan amount greater than 0.';
  if (!isNumber(rate) || Number(rate) > 100) errors.rate = 'Enter a rate between 0 and 100.';
  if (!/^\s*\d+\s*$/.test(years) || Number(years) < 1 || Number(years) > 50)
    errors.years = 'Enter a whole number of years from 1 to 50.';
  return errors;
}

function NumberField({ id, label, value, onChange, error, inputMode = 'decimal' }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        inputMode={inputMode}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="error">
          {error}
        </p>
      )}
    </div>
  );
}

export default function App() {
  const [amount, setAmount] = useState('300000');
  const [rate, setRate] = useState('6.5');
  const [years, setYears] = useState('30');

  // Everything below is derived from the three inputs: no extra state, no effects.
  const errors = validate({ amount, rate, years });
  const valid = Object.keys(errors).length === 0;
  let monthly = null;
  let total = null;
  let interest = null;
  if (valid) {
    const principal = Number(amount);
    monthly = monthlyPayment(principal, Number(rate), Number(years));
    total = monthly * Number(years) * 12;
    interest = total - principal;
  }
  const show = (n) => (n === null ? '—' : usd.format(n));

  return (
    <main className="calculator">
      <h1>Mortgage calculator</h1>
      <form className="form" onSubmit={(e) => e.preventDefault()}>
        <NumberField id="amount" label="Loan amount ($)" value={amount} onChange={setAmount} error={errors.amount} />
        <NumberField id="rate" label="Annual interest rate (%)" value={rate} onChange={setRate} error={errors.rate} />
        <NumberField
          id="years"
          label="Loan term (years)"
          value={years}
          onChange={setYears}
          error={errors.years}
          inputMode="numeric"
        />
      </form>

      <dl className="results" aria-live="polite" aria-atomic="true">
        <div>
          <dt>Monthly payment</dt>
          <dd>{show(monthly)}</dd>
        </div>
        <div>
          <dt>Total paid</dt>
          <dd>{show(total)}</dd>
        </div>
        <div>
          <dt>Total interest</dt>
          <dd>{show(interest)}</dd>
        </div>
      </dl>
    </main>
  );
}
