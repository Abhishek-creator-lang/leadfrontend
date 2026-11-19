import React from 'react';
import './styles.css';

const IMAGES = [
  { src: 'https://picsum.photos/id/1015/800/450', alt: 'River winding through a green mountain valley' },
  { src: 'https://picsum.photos/id/1016/800/450', alt: 'Red rock canyon under a pale sky' },
  { src: 'https://picsum.photos/id/1018/800/450', alt: 'Snow-capped peaks above a pine forest' },
  { src: 'https://picsum.photos/id/1019/800/450', alt: 'Calm sea stretching to the horizon' },
  { src: 'https://picsum.photos/id/1022/800/450', alt: 'Northern lights over a frozen lake' },
];

// TODO: track the current image, wire up previous/next (with wrap-around),
// the dot buttons, ArrowLeft/ArrowRight, and the carousel ARIA attributes.
export function ImageCarousel({ images }) {
  const current = images[0];
  return (
    <section className="carousel">
      <div className="carousel-viewport">
        <img className="carousel-image" src={current.src} alt={current.alt} />
      </div>
      <button type="button" className="carousel-control carousel-control--prev">
        ‹
      </button>
      <button type="button" className="carousel-control carousel-control--next">
        ›
      </button>
      <div className="carousel-dots">
        {images.map((image) => (
          <button type="button" key={image.src} className="carousel-dot" />
        ))}
      </div>
    </section>
  );
}

export default function App() {
  return <ImageCarousel images={IMAGES} />;
}
