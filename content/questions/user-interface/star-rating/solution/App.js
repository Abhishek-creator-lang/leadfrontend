import React, { useId, useState } from 'react';
import './styles.css';

export function StarRating({ max = 5, defaultValue = 0, label = 'Rating', name, onChange }) {
  const [value, setValue] = useState(defaultValue);
  const [hover, setHover] = useState(0);
  const generatedName = useId();
  const groupName = name ?? generatedName;

  // What the stars show: the hover preview wins over the committed value.
  const displayed = hover || value;

  const update = (next) => {
    setValue(next);
    onChange?.(next);
  };

  const stars = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <fieldset className="rating">
      <legend>{label}</legend>
      <div className="stars" onMouseLeave={() => setHover(0)}>
        {stars.map((n) => (
          <label
            key={n}
            className={`star${n <= displayed ? ' star--filled' : ''}`}
            onMouseEnter={() => setHover(n)}
          >
            <input
              type="radio"
              className="visually-hidden"
              name={groupName}
              value={n}
              checked={value === n}
              onChange={() => update(n)}
            />
            <span aria-hidden="true">★</span>
            <span className="visually-hidden">
              {n} {n === 1 ? 'star' : 'stars'}
            </span>
          </label>
        ))}
      </div>
      <div className="rating-footer">
        <p className="rating-text">{value ? `${value} out of ${max}` : 'Not rated'}</p>
        {value > 0 && (
          <button type="button" className="clear-button" onClick={() => update(0)}>
            Clear rating
          </button>
        )}
      </div>
    </fieldset>
  );
}

export default function App() {
  return <StarRating label="Rate this recipe" />;
}
