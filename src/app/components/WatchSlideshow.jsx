"use client";

import { useState, useEffect } from "react";

// ─── EditorialDarkCarousel ───────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// collection         Array      [...]           Data collection of slides
// autoPlayInterval   number     6000            Interval for slide transition in ms
// borderColor        string     "border-..."    Tailwind structural line color
// fontSerifClass     string     "font-[Cinzel]" Premium display typography class
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_COLLECTION = [
  {
    serial: "01",
    title: "Elegance",
    description:
      "An unyielding pursuit of minimalist proportion, structural honesty, and functional permanence.",
    imageUrl:
      "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?q=80&w=870&auto=format&fit=crop",
    imageAlt: "Premium mechanical timepiece face details",
  },
  {
    serial: "02",
    title: "Mechanics",
    description:
      "The hidden internal synchronization of physical forces, balance wheels, and calibrated gears.",
    imageUrl:
      "https://images.unsplash.com/photo-1548171838-1fd4cb4ab854?q=80&w=774&auto=format&fit=crop",
    imageAlt: "Internal automatic balance wheel gear assembly",
  },
  {
    serial: "03",
    title: "Adventure",
    description:
      "Forging dynamic utilities designed to map uncharted territories and endure the elements.",
    imageUrl:
      "https://images.unsplash.com/photo-1620421895918-b4e8c86648fb?q=80&w=870&auto=format&fit=crop",
    imageAlt: "Rugged chronograph timepiece explorer gear",
  },
];

export default function WatchSlideshow({
  collection = DEFAULT_COLLECTION,
  autoPlayInterval = 6000,
  borderColor = "border-zinc-800/80",
  fontSerifClass = "font-[Cinzel]",
}) {
  const [current, setCurrent] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || autoPlayInterval <= 0) return;

    const timer = setInterval(() => {
      handleSlideChange((current + 1) % collection.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [current, isMounted, autoPlayInterval, collection.length]);

  const handleSlideChange = (index) => {
    setCurrent(index);
    setFadeKey((prev) => prev + 1);
  };

  if (!isMounted) {
    return <div className="w-full h-screen bg-zinc-950" />;
  }

  const activeSlide = collection[current] || collection[0];

  return (
    <div className="w-full h-screen text-zinc-100 font-sans antialiased flex items-center justify-center p-4 sm:p-8 md:p-12 select-none relative bg-zinc-950">
      {/* Changing Parent Background Layer with Cross-Fade */}
      {collection.map((slide, index) => (
        <div
          key={`parent-bg-${index}`}
          className="absolute inset-0 bg-center bg-cover transition-opacity duration-[1000ms] ease-in-out"
          style={{
            backgroundImage: `url(${slide.imageUrl})`,
            opacity: index === current ? 0.15 : 0,
          }}
        />
      ))}

      {/* Ambient Blur & Vignette Overlay */}
      <div className="absolute inset-0 bg-zinc-950/40 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950 pointer-events-none z-0" />

      {/* Editorial Framed Container Box */}
      <div
        className={`w-full max-w-6xl h-[600px] md:h-[550px] grid grid-cols-1 md:grid-cols-12 border ${borderColor} relative bg-zinc-900/90 overflow-hidden shadow-2xl backdrop-blur-md z-10`}
      >
        {/* Left Column: Contextual Typography (5/12 grid span) */}
        <div
          className={`md:col-span-5 flex flex-col justify-between p-8 md:p-12 border-b md:border-b-0 md:border-r ${borderColor} z-10 bg-zinc-900/40`}
        >
          {/* Top Row: Navigation Indexing */}
          <div className="flex items-center justify-between">
            <span className="text-xs tracking-[0.2em] uppercase font-semibold text-zinc-500">
              Lookbook Series
            </span>
            <span
              key={`serial-${fadeKey}`}
              className="text-xs font-mono font-medium text-zinc-500 animate-fade"
            >
              {activeSlide.serial} //{" "}
              {String(collection.length).padStart(2, "0")}
            </span>
          </div>

          {/* Center Row: Core Copy Content Layout */}
          <div className="my-auto py-8">
            <h1
              key={`title-${fadeKey}`}
              className={`text-4xl md:text-5xl font-light tracking-wide text-white lowercase mb-4 animate-fade ${fontSerifClass}`}
            >
              {activeSlide.title}.
            </h1>
            <p
              key={`desc-${fadeKey}`}
              className="text-sm text-zinc-400 font-light leading-relaxed tracking-wide max-w-sm animate-fade"
              style={{ animationDelay: "100ms" }}
            >
              {activeSlide.description}
            </p>
          </div>

          {/* Bottom Row: Minimal Textual Pagination Triggers */}
          <div className="flex gap-4 items-center">
            {collection.map((slide, index) => (
              <button
                key={index}
                onClick={() => handleSlideChange(index)}
                className={`text-xs font-mono transition-all duration-300 pb-1 border-b tracking-tighter outline-none ${
                  index === current
                    ? "border-white text-white font-bold"
                    : "border-transparent text-zinc-600 hover:text-zinc-400"
                }`}
              >
                {slide.serial}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Imagery Section Showcase (7/12 grid span) */}
        <div className="md:col-span-7 relative h-full w-full bg-zinc-950 overflow-hidden">
          {collection.map((slide, index) => (
            <div
              key={`img-${index}`}
              className="absolute inset-0 transition-all duration-[1200ms] ease-in-out"
              style={{
                opacity: index === current ? 1 : 0,
                transform: index === current ? "scale(1)" : "scale(1.05)",
                clipPath:
                  index === current
                    ? "inset(0% 0% 0% 0%)"
                    : "inset(0% 0% 0% 100%)",
                zIndex: index === current ? 10 : 0,
                transitionProperty: "opacity, transform, clip-path",
              }}
            >
              <img
                src={slide.imageUrl}
                alt={slide.imageAlt}
                className="h-full w-full object-cover object-center brightness-[0.85] contrast-[1.05]"
              />
            </div>
          ))}

          {/* Subtle editorial separation line over the image canvas */}
          <div className="absolute top-0 left-0 bottom-0 w-px bg-white/5 z-20 pointer-events-none" />
        </div>
      </div>

      {/* Global CSS Styling Animation Injections */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@300;400&display=swap");

        @keyframes editorialFade {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade {
          animation: editorialFade 0.7s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>
    </div>
  );
}
