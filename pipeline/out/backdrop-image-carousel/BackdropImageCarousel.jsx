"use client";

import { useState, useEffect, useRef } from "react";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1504333638930-c8787321eee0?q=80&w=1170&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1445905595283-21f8ae8a33d2?q=80&w=1173&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=1171&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1597617847923-ca1fdbacc0b1?q=80&w=1058&auto=format&fit=crop",
];

export default function BackdropImageCarousel({
  images = DEFAULT_IMAGES,
  autoPlayInterval = 4000,
  cardWidth = "max-w-[460px]",
  backdropOpacity = "opacity-40",
  backgroundColor = "#0a0a0a",
  textColor = "#ffffff",
  altText = "Exhibition view",
  className = "",
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    startTimer();
    return () => stopTimer();
  }, [currentIndex]);

  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      handleNext();
    }, autoPlayInterval);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= images.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className={`relative w-full h-screen font-sans overflow-hidden flex items-center justify-center antialiased ${className}`}
      style={{ backgroundColor, color: textColor }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes load {
            from { width: 0%; }
            to { width: 100%; }
          }
        `,
        }}
      />

      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        {images.map((src, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-center bg-cover transition-all duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${
              index === currentIndex
                ? `${backdropOpacity} scale-100`
                : "opacity-0 scale-105"
            }`}
            style={{ backgroundImage: `url('${src}')` }}
          />
        ))}
        </div>

      <div
        className={`relative z-10 w-full ${cardWidth} mx-4 flex flex-col gap-5`}
      >
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] bg-white/5 border border-white/10 backdrop-blur-md">
          {images.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`${altText} ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                index === currentIndex
                  ? "opacity-100 scale-100 rotate-0"
                  : "opacity-0 scale-105"
              }`}
            />
          ))}

              {mounted && (
            <div className="absolute bottom-0 left-0 h-[3px] w-full z-20 bg-white/10">
              <div
                key={currentIndex}
                className="h-full bg-white"
                style={{
                  animation: `load linear forwards`,
                  animationDuration: `${autoPlayInterval}ms`,
                }}
              />
            </div>
          )}
        </div>

          <div className="flex items-center justify-between px-2 bg-neutral-900/40 border border-white/5 rounded-xl backdrop-blur-sm py-2">
              <div className="flex items-center gap-1.5 pl-2">
            <span className="text-sm font-semibold tracking-wider font-mono">
              {String(currentIndex + 1).padStart(2, "0")}
            </span>
            <span className="text-white/30 text-xs">/</span>
            <span className="text-white/40 text-xs font-mono">
              {String(images.length).padStart(2, "0")}
            </span>
          </div>

              <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="group flex items-center justify-center w-9 h-9 rounded-lg border border-white/0 text-white/60 transition-all duration-200 hover:text-white hover:bg-white/10 hover:border-white/10 focus:outline-none"
              aria-label="Previous image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="group flex items-center justify-center w-9 h-9 rounded-lg border border-white/0 text-white/60 transition-all duration-200 hover:text-white hover:bg-white/10 hover:border-white/10 focus:outline-none"
              aria-label="Next image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
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
    </div>
  );
}
