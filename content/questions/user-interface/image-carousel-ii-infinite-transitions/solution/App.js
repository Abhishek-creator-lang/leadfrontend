import React, { useCallback, useEffect, useId, useState } from 'react';
import './styles.css';

const IMAGES = [
  { id: 'river', src: 'https://picsum.photos/id/1015/800/450', alt: 'River winding through a green mountain valley' },
  { id: 'canyon', src: 'https://picsum.photos/id/1016/800/450', alt: 'Red rock canyon under a pale sky' },
  { id: 'peaks', src: 'https://picsum.photos/id/1018/800/450', alt: 'Snow-capped peaks above a pine forest' },
  { id: 'sea', src: 'https://picsum.photos/id/1019/800/450', alt: 'Calm sea stretching to the horizon' },
  { id: 'aurora', src: 'https://picsum.photos/id/1022/800/450', alt: 'Northern lights over a frozen lake' },
];

const DURATION = 400; // ms; drives both the inline transition and the safety timeout.
const wrap = (i, n) => ((i % n) + n) % n;

function usePrefersReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(query).matches
  );
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mql = window.matchMedia(query);
    const onChange = () => setReduced(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

export function ImageCarousel({ images, label = 'Photo gallery' }) {
  const count = images.length;
  // Track layout: [clone of last, ...images, clone of first].
  // `pos` is the index in the track, so the real image i lives at pos i + 1.
  const [pos, setPos] = useState(1);
  const [animating, setAnimating] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const viewportId = useId();

  const current = wrap(pos - 1, count); // index of the real image being shown

  // Called when a slide transition finishes. If we landed on a clone, jump
  // (without animation) to the real slide it mirrors. Idempotent on purpose:
  // both `transitionend` and the safety timeout may call it.
  const finish = useCallback(() => {
    setAnimating(false);
    setPos((p) => (p === 0 ? count : p === count + 1 ? 1 : p));
  }, [count]);

  // Safety net: transitionend doesn't fire if the transition is interrupted or
  // the element is hidden, which would otherwise lock the carousel forever.
  useEffect(() => {
    if (!animating) return undefined;
    const t = setTimeout(finish, DURATION + 100);
    return () => clearTimeout(t);
  }, [animating, finish]);

  const moveTo = (targetPos) => {
    if (animating || targetPos === pos) return; // ignore clicks mid-flight
    if (reducedMotion) {
      setPos(wrap(targetPos - 1, count) + 1); // snap straight to the real slide
      return;
    }
    setAnimating(true);
    setPos(targetPos);
  };

  const prev = () => moveTo(pos - 1);
  const next = () => moveTo(pos + 1);

  if (count === 0) return <p>No images to show.</p>;

  const slides = [images[count - 1], ...images, images[0]];

  return (
    <section
      className="carousel"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          prev();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          next();
        }
      }}
    >
      <div className="carousel-viewport" id={viewportId} aria-live="polite">
        <div
          className="carousel-track"
          style={{
            transform: `translateX(-${pos * 100}%)`,
            transition: animating ? `transform ${DURATION}ms ease-in-out` : 'none',
          }}
          onTransitionEnd={(e) => {
            // Ignore transitions bubbling up from children (e.g. hover styles).
            if (e.target === e.currentTarget && e.propertyName === 'transform') finish();
          }}
        >
          {slides.map((img, trackIndex) => {
            const isClone = trackIndex === 0 || trackIndex === count + 1;
            const isActive = trackIndex === pos;
            return (
              <div
                key={isClone ? `clone-${trackIndex}` : img.id}
                className="carousel-slide"
                role={isClone ? undefined : 'group'}
                aria-roledescription={isClone ? undefined : 'slide'}
                aria-label={isClone ? undefined : `${trackIndex} of ${count}`}
                aria-hidden={isActive ? undefined : true}
              >
                <img className="carousel-image" src={img.src} alt={isClone ? '' : img.alt} draggable="false" />
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        className="carousel-control carousel-control--prev"
        aria-label="Previous image"
        aria-controls={viewportId}
        onClick={prev}
      >
        <span aria-hidden="true">‹</span>
      </button>
      <button
        type="button"
        className="carousel-control carousel-control--next"
        aria-label="Next image"
        aria-controls={viewportId}
        onClick={next}
      >
        <span aria-hidden="true">›</span>
      </button>

      <div className="carousel-dots" role="group" aria-label="Choose image">
        {images.map((img, i) => (
          <button
            type="button"
            key={img.id}
            className={`carousel-dot${i === current ? ' carousel-dot--active' : ''}`}
            aria-label={`Show image ${i + 1}`}
            aria-current={i === current ? 'true' : undefined}
            aria-controls={viewportId}
            onClick={() => moveTo(i + 1)}
          />
        ))}
      </div>
    </section>
  );
}

export default function App() {
  return <ImageCarousel images={IMAGES} />;
}
