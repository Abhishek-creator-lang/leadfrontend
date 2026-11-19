import React, { useState } from 'react';
import './styles.css';

// TODO: validate inputs, compute monthly payment / total / interest, format as USD.
export default function App() {
  const [amount, setAmount] = useState('300000');
  const [rate, setRate] = useState('6.5');
  const [years, setYears] = useState('30');

  return (
    <main className="calculator">
      <h1>Mortgage calculator</h1>
      <form className="form" onSubmit={(e) => e.preventDefault()}>
        <div className="field">
          <label htmlFor="amount">Loan amount ($)</label>
          <input id="amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="rate">Annual interest rate (%)</label>
          <input id="rate" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="years">Loan term (years)</label>
          <input id="years" inputMode="numeric" value={years} onChange={(e) => setYears(e.target.value)} />
        </div>
      </form>

      <dl className="results">
        <div>
          <dt>Monthly payment</dt>
          <dd>—</dd>
        </div>
        <div>
          <dt>Total paid</dt>
          <dd>—</dd>
        </div>
        <div>
          <dt>Total interest</dt>
          <dd>—</dd>
        </div>
      </dl>
    </main>
  );
}
