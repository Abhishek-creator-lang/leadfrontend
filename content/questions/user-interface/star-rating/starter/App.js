import React from 'react';
import './styles.css';

// TODO: make the stars an accessible input with click, hover preview, keyboard and clear.
export function StarRating({ max = 5, defaultValue = 0, label = 'Rating', onChange }) {
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  return (
    <div className="rating">
      <p>{label}</p>
      <div className="stars">
        {stars.map((n) => (
          <span key={n} className="star">
            ★
          </span>
        ))}
      </div>
      <p className="rating-text">Not rated</p>
    </div>
  );
}

export default function App() {
  return <StarRating label="Rate this recipe" />;
}
