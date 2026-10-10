"use client";

import React, { useState, useEffect, useRef } from "react";

const INITIAL_MEMBERS = [
  {
    id: 1,
    name: "Luffy",
    role: "Captain",
    img: "https://ik.imagekit.io/gopichakradhar/luffy/o1.jpeg",
  },
  {
    id: 2,
    name: "Monkey D. Luffy",
    role: "Founder",
    img: "https://ik.imagekit.io/gopichakradhar/luffy/o2.jpeg",
  },
  {
    id: 3,
    name: "Luffy chan",
    role: "Pirate",
    img: "https://ik.imagekit.io/gopichakradhar/luffy/o4.jpeg",
  },
  {
    id: 4,
    name: "Lucy",
    role: "Gladiator",
    img: "https://ik.imagekit.io/gopichakradhar/luffy/o3.jpeg",
  },
  {
    id: 5,
    name: "Luffy kun",
    role: "Hero",
    img: "https://ik.imagekit.io/gopichakradhar/luffy/o5.jpeg",
  },
  {
    id: 6,
    name: "Monkey chan",
    role: "Snakeman",
    img: "https://ik.imagekit.io/gopichakradhar/luffy/o6.jpeg",
  },
];

export default function VerticalLoopCarousel({
  items = INITIAL_MEMBERS,
  autoPlay = false,
  interval = 5000,
  className = "",
}) {
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!autoPlay || items.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, items.length]);

  if (!mounted) {
    return <div className="min-h-screen w-full bg-neutral-950" />;
  }

  if (!items || items.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleTouchStart = (e) => {
    touchStart.current = e.targetTouches[0].clientY;
  };
  const handleTouchMove = (e) => {
    touchEnd.current = e.targetTouches[0].clientY;
  };
  const handleTouchEnd = () => {
    if (touchStart.current - touchEnd.current > 40) handleNext();
    if (touchStart.current - touchEnd.current < -40) handlePrev();
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-center bg-neutral-950 text-neutral-100 font-sans select-none px-6 md:px-12 ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
        {/* Left Side: Cascading 3D Stage */}
        <div className="relative flex items-center justify-center h-[400px] md:h-[540px] [perspective:1200px]">
          <div className="relative w-[280px] h-[180px] sm:w-[360px] sm:h-[230px] md:w-[400px] md:h-[260px] [transform-style:preserve-3d]">
            {items.map((item, index) => {
              let offset = index - currentIndex;

              // Loop boundary normalization
              if (offset < -Math.floor(items.length / 2))
                offset += items.length;
              if (offset > Math.floor(items.length / 2)) offset -= items.length;

              const isActive = index === currentIndex;

              // Dynamic Tailwind class generation based on index offsets
              let positionClasses = "";
              let opacityClass = "opacity-0 pointer-events-none";
              let zIndexClass = "z-0";

              if (offset === 0) {
                // Active Card (Front & Center)
                positionClasses =
                  "translate-y-0 translate-z-0 rotate-x-0 scale-100";
                opacityClass =
                  "opacity-100 pointer-events-auto shadow-[0_30px_70px_-15px_rgba(0,0,0,0.8)] border-neutral-700/70";
                zIndexClass = "z-30";
              } else if (offset === 1) {
                // One step below
                positionClasses =
                  "translate-y-[55px] -translate-z-[70px] -rotate-x-[12deg] scale-[0.92]";
                opacityClass =
                  "opacity-45 hover:opacity-60 pointer-events-auto border-neutral-800/60";
                zIndexClass = "z-20";
              } else if (offset === 2) {
                // Two steps below
                positionClasses =
                  "translate-y-[105px] -translate-z-[140px] -rotate-x-[20deg] scale-[0.84]";
                opacityClass =
                  "opacity-15 pointer-events-none border-neutral-900";
                zIndexClass = "z-10";
              } else if (offset === -1) {
                // One step above
                positionClasses =
                  "-translate-y-[55px] -translate-z-[70px] rotate-x-[12deg] scale-[0.92]";
                opacityClass =
                  "opacity-45 hover:opacity-60 pointer-events-auto border-neutral-800/60";
                zIndexClass = "z-20";
              } else if (offset === -2) {
                // Two steps above
                positionClasses =
                  "-translate-y-[105px] -translate-z-[140px] rotate-x-[20deg] scale-[0.84]";
                opacityClass =
                  "opacity-15 pointer-events-none border-neutral-900";
                zIndexClass = "z-10";
              }

              return (
                <div
                  key={item.id || index}
                  onClick={() => setCurrentIndex(index)}
                  className={`absolute inset-0 rounded-2xl overflow-hidden bg-neutral-900 border 
                    transition-all duration-[750px] cubic-bezier(0.25, 1, 0.5, 1)
                    transform-gpu will-change-transform [transform-style:preserve-3d] cursor-pointer group
                    ${positionClasses} ${opacityClass} ${zIndexClass}`}
                >
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="eager"
                  />
                  <div
                    className={`absolute inset-0 transition-opacity duration-500 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent ${isActive ? "opacity-50" : "opacity-80"}`}
                  />
                </div>
              );
            })}
          </div>

          {/* Quick Mobile Tap Controls */}
          <div className="absolute inset-x-0 bottom-0 flex justify-between px-6 md:hidden z-40">
            <button
              onClick={handlePrev}
              className="p-3 bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-full active:scale-90 transition-transform"
            >
              <svg
                className="w-4 h-4 text-neutral-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="p-3 bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-full active:scale-90 transition-transform"
            >
              <svg
                className="w-4 h-4 text-neutral-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Right Side: Info Block & Interface Controls */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left justify-center">
          <div className="h-28 flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-50 via-neutral-200 to-neutral-400">
              {items[currentIndex].name}
            </h2>
            <p className="text-neutral-400 font-bold tracking-widest mt-2.5 uppercase text-xs">
              {items[currentIndex].role}
            </p>
          </div>

          {/* Desktop Arrow Utilities */}
          <div className="hidden md:flex gap-3 mt-8">
            <button
              onClick={handlePrev}
              className="p-3.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 rounded-xl transition-all duration-200 active:scale-95"
              aria-label="Previous frame"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="p-3.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 rounded-xl transition-all duration-200 active:scale-95"
              aria-label="Next frame"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Progress Dot Mapping */}
          <div className="flex justify-center md:justify-start gap-2 mt-10">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                  index === currentIndex
                    ? "w-8 bg-neutral-100"
                    : "w-1.5 bg-neutral-800 hover:bg-neutral-700"
                }`}
                aria-label={`Jump to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
