import React, { useId, useState } from 'react';
import './styles.css';

const IMAGES = [
  { id: 'river', src: 'https://picsum.photos/id/1015/800/450', alt: 'River winding through a green mountain valley' },
  { id: 'canyon', src: 'https://picsum.photos/id/1016/800/450', alt: 'Red rock canyon under a pale sky' },
  { id: 'peaks', src: 'https://picsum.photos/id/1018/800/450', alt: 'Snow-capped peaks above a pine forest' },
  { id: 'sea', src: 'https://picsum.photos/id/1019/800/450', alt: 'Calm sea stretching to the horizon' },
  { id: 'aurora', src: 'https://picsum.photos/id/1022/800/450', alt: 'Northern lights over a frozen lake' },
];

const wrap = (i, n) => ((i % n) + n) % n;

// Working carousel from part I. It snaps between images.
// TODO: render all slides in a track and animate translateX, loop seamlessly in both
// directions, survive rapid clicks and respect prefers-reduced-motion.
export function ImageCarousel({ images, label = 'Photo gallery' }) {
  const [index, setIndex] = useState(0);
  const viewportId = useId();
  const count = images.length;
  const go = (i) => setIndex(wrap(i, count));
  const image = images[index];

  return (
    <section
      className="carousel"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') go(index - 1);
        if (e.key === 'ArrowRight') go(index + 1);
      }}
    >
      <div className="carousel-viewport" id={viewportId} aria-live="polite">
        <div role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${count}`} className="carousel-slide">
          <img className="carousel-image" src={image.src} alt={image.alt} />
        </div>
      </div>
      <button type="button" className="carousel-control carousel-control--prev" aria-label="Previous image" onClick={() => go(index - 1)}>
        <span aria-hidden="true">‹</span>
      </button>
      <button type="button" className="carousel-control carousel-control--next" aria-label="Next image" onClick={() => go(index + 1)}>
        <span aria-hidden="true">›</span>
      </button>
      <div className="carousel-dots" role="group" aria-label="Choose image">
        {images.map((img, i) => (
          <button
            type="button"
            key={img.id}
            className={`carousel-dot${i === index ? ' carousel-dot--active' : ''}`}
            aria-label={`Show image ${i + 1}`}
            aria-current={i === index ? 'true' : undefined}
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
