import React, { useId, useState } from 'react';
import './styles.css';

const IMAGES = [
  { src: 'https://picsum.photos/id/1015/800/450', alt: 'River winding through a green mountain valley' },
  { src: 'https://picsum.photos/id/1016/800/450', alt: 'Red rock canyon under a pale sky' },
  { src: 'https://picsum.photos/id/1018/800/450', alt: 'Snow-capped peaks above a pine forest' },
  { src: 'https://picsum.photos/id/1019/800/450', alt: 'Calm sea stretching to the horizon' },
  { src: 'https://picsum.photos/id/1022/800/450', alt: 'Northern lights over a frozen lake' },
];

// Modulo that also works for negative numbers: wrap(-1, 5) === 4.
const wrap = (i, n) => ((i % n) + n) % n;

export function ImageCarousel({ images, label = 'Photo gallery' }) {
  const [index, setIndex] = useState(0);
  const viewportId = useId();
  const count = images.length;

  if (count === 0) {
    return <p className="carousel-empty">No images to show.</p>;
  }

  // Clamp in case the images prop shrinks while we're on a later slide.
  const current = Math.min(index, count - 1);
  const image = images[current];
  const go = (next) => setIndex(wrap(next, count));

  const onKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(current - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(current + 1);
    }
  };

  return (
    <section className="carousel" aria-roledescription="carousel" aria-label={label} onKeyDown={onKeyDown}>
      <div className="carousel-viewport" id={viewportId} aria-live="polite">
        <div role="group" aria-roledescription="slide" aria-label={`${current + 1} of ${count}`} className="carousel-slide">
          <img className="carousel-image" src={image.src} alt={image.alt} />
        </div>
      </div>

      <button
        type="button"
        className="carousel-control carousel-control--prev"
        aria-label="Previous image"
        aria-controls={viewportId}
        onClick={() => go(current - 1)}
      >
        <span aria-hidden="true">‹</span>
      </button>
      <button
        type="button"
        className="carousel-control carousel-control--next"
        aria-label="Next image"
        aria-controls={viewportId}
        onClick={() => go(current + 1)}
      >
        <span aria-hidden="true">›</span>
      </button>

      <div className="carousel-dots" role="group" aria-label="Choose image">
        {images.map((img, i) => (
          <button
            type="button"
            key={img.src}
            className={`carousel-dot${i === current ? ' carousel-dot--active' : ''}`}
            aria-label={`Show image ${i + 1}`}
            aria-current={i === current ? 'true' : undefined}
            aria-controls={viewportId}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </section>
  );
}

export default function App() {
  return <ImageCarousel images={IMAGES} />;
}
