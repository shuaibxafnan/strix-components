"use client";

import React, { useState } from "react";

/**
 * 3DBookGallery Props
 * ──────────────────────────────────────────────────────────────────────────
 * books           Array    List of objects containing { front: string, back: string, altFront?: string, altBack?: string }
 * width           number   200 (Width of an individual book in pixels)
 * height          number   300 (Height of an individual book in pixels)
 * perspective     number   1000 (Perspective depth in pixels)
 * spineShift      number   100 (How many pixels the stack shifts right when a book opens)
 * bgImage         string   Unsplash default (Background image URL for the scene)
 * headingText     string   ["Book", "Gallery"] (Array of two strings for background typography)
 * fontClass       string   "font-sans" (Tailwind font family utility class)
 * animationSpeed  number   500 (Transition duration in milliseconds)
 * ──────────────────────────────────────────────────────────────────────────
 */

const DEFAULT_BOOKS = [
  {
    front:
      "https://images.unsplash.com/photo-1767122374969-82c7acbbb4ed?q=80&w=400&auto=format&fit=crop",
    back: "https://images.unsplash.com/photo-1764617755316-ffb5ff87c2d7?q=80&w=400&auto=format&fit=crop",
  },
  {
    front:
      "https://images.unsplash.com/photo-1767749559743-d2e4d8031d4f?q=80&w=687&auto=format&fit=crop",
    back: "https://images.unsplash.com/photo-1767700358934-3466f476d948?q=80&w=687&auto=format&fit=crop",
  },
  {
    front:
      "https://images.unsplash.com/photo-1767517734918-d0969751b6b6?q=80&w=735&auto=format&fit=crop",
    back: "https://images.unsplash.com/photo-1764377724372-d42fed3f442b?q=80&w=687&auto=format&fit=crop",
  },
  {
    front:
      "https://images.unsplash.com/photo-1767518782545-17fa47a602e2?q=80&w=687&auto=format&fit=crop",
    back: "https://plus.unsplash.com/premium_photo-1747851577288-c75149e91e1a?q=80&w=687&auto=format&fit=crop",
  },
  {
    front:
      "https://plus.unsplash.com/premium_photo-1666264200758-1c03db7f530c?q=80&w=687&auto=format&fit=crop",
    back: "https://images.unsplash.com/photo-1763906667544-02814d191864?q=80&w=709&auto=format&fit=crop",
  },
];

export default function BookGallery3D({
  books = DEFAULT_BOOKS,
  width = 200,
  height = 300,
  perspective = 1200, // Slightly higher perspective improves 3D depth separation
  spineShift = 100,
  bgImage = "https://images.unsplash.com/photo-1763152496539-302ef51ef66f?q=80&w=687&auto=format&fit=crop",
  headingText = ["Book", "Gallery"],
  fontClass = "font-sans",
  animationSpeed = 600, // 600ms gives cleaner visual tracking for page physics
}) {
  const [openBookIndex, setOpenBookIndex] = useState(null);

  const handleSceneClick = () => {
    setOpenBookIndex(null);
  };

  const handleBookClick = (e, index) => {
    e.stopPropagation();
    // If clicking the current open book, close it. Otherwise, set the target book open.
    setOpenBookIndex(openBookIndex === index ? null : index);
  };

  const totalBooks = books.length;
  const isAnyBookOpen = openBookIndex !== null;

  return (
    <div
      onClick={handleSceneClick}
      className={`relative w-full h-screen select-none overflow-hidden flex items-center justify-center bg-cover bg-center bg-[#e0e0e0] ${fontClass}`}
      style={{
        backgroundImage: `url("${bgImage}")`,
        perspective: `${perspective}px`,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Background Typography */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 flex w-full -translate-x-1/2 -translate-y-1/2 items-center justify-between px-[5vw] text-center text-[clamp(4rem,15vw,15rem)] font-extrabold leading-[0.8] text-white mix-blend-exclusion">
        <span className="block">{headingText[0]}</span>
        <span className="block">{headingText[1]}</span>
      </div>

      {/* 3D Container Stack */}
      <div
        className="relative flex items-center justify-center"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transformStyle: "preserve-3d",
          transform: `translateX(${isAnyBookOpen ? spineShift : 0}px)`,
          transition: `transform ${animationSpeed}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
      >
        {books.map((book, index) => {
          const isOpen = openBookIndex !== null && index <= openBookIndex;

          // Cascading layout logic: All sheets up to the selected item pivot over
          // This stops pages from clipping through one another awkwardly.
          const delayFactor = isOpen ? index : totalBooks - 1 - index;
          const runningDelay = delayFactor * 60;

          // Layer sorting management to ensure accurate front-to-back sorting
          const zIndex = isOpen ? 20 + index : 10 - index;

          return (
            <div
              key={index}
              onClick={(e) => handleBookClick(e, index)}
              className="absolute left-0 top-0 cursor-pointer rounded-sm shadow-[2px_4px_12px_rgba(0,0,0,0.25)]"
              style={{
                width: `${width}px`,
                height: `${height}px`,
                transformStyle: "preserve-3d",
                transformOrigin: "left center",
                zIndex: zIndex,
                transform: `rotateY(${isOpen ? -180 : 0}deg)`,
                transition: `transform ${animationSpeed}ms cubic-bezier(0.4, 0, 0.2, 1), z-index 0s`,
                transitionDelay: `${runningDelay}ms, ${isOpen ? 0 : animationSpeed}ms`,
              }}
            >
              {/* Front Facing Page Plate */}
              <div
                className="absolute inset-0 h-full w-full bg-[#f4f4f4] border-r-2 border-t-2 border-b-2 border-white overflow-hidden rounded-r-lg"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(0deg)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={book.front}
                  alt={`Page Front ${index + 1}`}
                  className="h-full w-full object-cover pointer-events-none"
                />
              </div>

              {/* Reverse Facing Left Page Plate */}
              <div
                className="absolute inset-0 h-full w-full bg-[#f4f4f4] border-l-2 border-t-2 border-b-2 border-white overflow-hidden rounded-l-lg"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  zIndex: 1,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={book.back}
                  alt={`Page Back ${index + 1}`}
                  className="h-full w-full object-cover pointer-events-none"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
