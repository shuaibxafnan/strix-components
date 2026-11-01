"use client";

import { useState, useEffect, useRef } from "react";

const DEFAULT_SLIDES = [
  "https://images.unsplash.com/photo-1603568301602-3924e87dc8d6?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1574610758891-5b809b6e6e2e?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506606401543-2e73709cebb4?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1400&auto=format&fit=crop",
];

export default function FocusShowcaseSlider({
  images = DEFAULT_SLIDES,
  frameSize = "h-[50vh] w-[50vh] max-w-[90vw] max-h-[90vw]",
  backdropBlur = "backdrop-blur-md",
  overlayTint = "bg-slate-950/65",
  animationConfig = "duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
  shadowProfile = "shadow-[0_30px_70px_-10px_rgba(0,0,0,0.7),0_0_50px_rgba(255,255,255,0.05)]",
  className = "",
}) {
  const [mounted, setMounted] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    return () => clearTimeout(timerRef.current);
  }, []);

  const changeSlide = (newIndex) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveSlide(newIndex);
    timerRef.current = setTimeout(() => setIsAnimating(false), 800);
  };

  const handleNext = () => {
    changeSlide(activeSlide >= images.length - 1 ? 0 : activeSlide + 1);
  };

  const handlePrev = () => {
    changeSlide(activeSlide <= 0 ? images.length - 1 : activeSlide - 1);
  };

  if (!mounted || !images.length) {
    return <div className="w-full h-screen bg-slate-950" />;
  }

  return (
    <div
      className={`w-full h-screen flex flex-col items-center justify-center overflow-hidden relative bg-center bg-cover transition-all ${animationConfig} ${className}`}
      style={{ backgroundImage: `url('${images[activeSlide]}')` }}
    >
      <div
        className={`absolute inset-0 z-0 transition-all ${animationConfig} ${overlayTint} ${backdropBlur}`}
      />

      <div className="flex flex-col items-center gap-12 z-10 select-none">
          <div
          className={`relative rounded-full overflow-hidden border border-white/10 ${frameSize} ${shadowProfile}`}
        >
          {images.map((url, idx) => (
            <div
              key={url}
              className={`absolute inset-0 bg-center bg-cover transition-all ${animationConfig} ${
                idx === activeSlide
                  ? "opacity-100 scale-100 rotate-0 z-20"
                  : "opacity-0 scale-110 -rotate-3 z-10 pointer-events-none"
              }`}
              style={{ backgroundImage: `url('${url}')` }}
            />
          ))}
        </div>

          <div className="flex items-center gap-6 bg-slate-900/40 border border-white/5 px-6 py-3.5 rounded-full backdrop-blur-md shadow-lg">
          <button
            onClick={handlePrev}
            disabled={isAnimating}
            aria-label="Previous image"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/30 active:scale-90 disabled:opacity-40 transition-all duration-300 ease-out"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.75}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>

              <div className="flex gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => changeSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                  idx === activeSlide
                    ? "w-6 bg-white"
                    : "w-1.5 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={isAnimating}
            aria-label="Next image"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/30 active:scale-90 disabled:opacity-40 transition-all duration-300 ease-out"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.75}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
