"use client";

import { useEffect, useRef, useState } from "react";

// ─── VerticalMouseDrivenCarousel ─────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor            string   "#021417"          Default page background color
// eyebrowFontSize    string   "text-lg"          Font size for the state/eyebrow text
// titleFontSize      string   "text-5xl md:text-6xl" Font size for the city/title text
// titleLetterSpacing string   "tracking-[8px]"   Letter spacing for the main title text
// titleLineHeight    string   "leading-none"     Line height for the main title text
// verticalPadding    string   "py-8"             Vertical padding for list items
// leftOffsetPercent  string   "pl-[54.1666%]"    Left positioning percentage for text layout
// indexLeftOffset    string   "left-[-45px]"     Negative left positioning for item numbers
// transitionSpeed    string   "duration-500"     CSS transition timing utility class
// ──────────────────────────────────────────────────────────────────────────

const AESTHETIC_SLIDES = [
  {
    id: "0",
    eyebrow: "Nevada",
    title: "Carson City",
    img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "1",
    eyebrow: "New Hampshire",
    title: "Concord",
    img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "2",
    eyebrow: "New York",
    title: "Albany",
    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "3",
    eyebrow: "Oklahoma",
    title: "Oklahoma City",
    img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "4",
    eyebrow: "North Carolina",
    title: "Raleigh",
    img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "5",
    eyebrow: "Utah",
    title: "Salt Lake City",
    img: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "6",
    eyebrow: "Missouri",
    title: "Jefferson City",
    img: "https://images.unsplash.com/photo-1500673922987-e212871fde22?auto=format&fit=crop&q=80&w=1200",
  },
];

export default function VerticalMouseDrivenCarousel({
  bgColor = "#021417",
  eyebrowFontSize = "text-lg",
  titleFontSize = "text-3xl md:text-4xl",
  titleLetterSpacing = "tracking-[8px]",
  titleLineHeight = "leading-none",
  verticalPadding = "py-8",
  leftOffsetPercent = "pl-[54.1666%]",
  indexLeftOffset = "left-[-45px]",
  transitionSpeed = "duration-500",
  slides = AESTHETIC_SLIDES,
}) {
  const [mounted, setMounted] = useState(false);
  const [currentId, setCurrentId] = useState(0);
  const [listY, setListY] = useState(0);

  const carouselRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = (e) => {
    if (!carouselRef.current || !listRef.current) return;

    const carouselRect = carouselRef.current.getBoundingClientRect();
    const listHeight = listRef.current.clientHeight;
    const carouselHeight = carouselRect.height;

    const relativeY = e.clientY - carouselRect.top;
    const offset = -(relativeY / carouselHeight) * listHeight;

    setListY(offset);
  };

  if (!mounted) {
    return (
      <div
        className="w-full min-h-screen"
        style={{ backgroundColor: bgColor }}
      />
    );
  }

  return (
    <div
      className="w-full h-screen relative overflow-hidden select-none"
      style={{ backgroundColor: bgColor }}
    >
      {/* core vertical carousel viewport bounds container */}
      <div
        ref={carouselRef}
        onMouseMove={handleMouseMove}
        className="w-full h-full relative"
      >
        {/* background graphics rendering deck layers */}
        {slides.map((slide, idx) => {
          const isVisible = idx === parseInt(currentId);
          return (
            <i
              key={`bg-${slide.id}`}
              style={{
                backgroundImage: `url('${slide.img}')`,
                transitionTimingFunction:
                  "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              }}
              className={`absolute top-0 left-0 w-full h-full bg-cover bg-center will-change-transform ${transitionSpeed} ${
                isVisible
                  ? "opacity-100 scale-100 z-10"
                  : "opacity-0 scale-[1.05] z-0"
              }`}
            />
          );
        })}

        {/* c-gradient-overlay ambient shadowing filter mesh layer */}
        <i className="absolute block left-0 top-0 w-full h-full bg-[radial-gradient(circle_at_49%_50%,rgba(2,21,25,0.3),rgba(2,21,25,0.6))] z-20 pointer-events-none" />

        {/* scroll track data slider block */}
        <ul
          ref={listRef}
          style={{
            transform: `translateY(${listY}px)`,
            transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className="w-full absolute left-0 top-1/2 z-30 list-none pointer-events-none will-change-transform"
        >
          {slides.map((slide, idx) => {
            const activeInt = parseInt(currentId);
            const distance = idx - activeInt;
            const absDistance = Math.abs(distance);

            let computedOpacity = 1;
            let computedOffsetX = 0;

            if (distance !== 0) {
              computedOpacity = 0.5 / absDistance;
              computedOffsetX = 5 * absDistance;
            }

            return (
              <li
                key={slide.id}
                data-item-id={slide.id}
                onMouseEnter={(e) => {
                  const id = e.currentTarget.getAttribute("data-item-id");
                  setCurrentId(id);
                }}
                style={{
                  opacity: computedOpacity,
                  transform: `translateX(${computedOffsetX}px)`,
                  transitionTimingFunction:
                    "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                }}
                className={`pointer-events-auto block ${transitionSpeed}`}
              >
                <a
                  href=""
                  onClick={(e) => e.preventDefault()}
                  className={`block ${verticalPadding} ${leftOffsetPercent}`}
                >
                  {/* state taxonomy sublabel reference layout line */}
                  <p
                    className={`relative pb-4 font-sans font-normal tracking-[1px] text-white ${eyebrowFontSize}`}
                  >
                    <span
                      className={`absolute top-0 font-mono opacity-80 ${indexLeftOffset}`}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>{" "}
                    {slide.eyebrow}
                  </p>

                  {/* main city destination headline banner layout row */}
                  <p
                    className={`font-sans uppercase font-bold text-white max-w-xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] ${titleFontSize} ${titleLineHeight} ${titleLetterSpacing}`}
                  >
                    {slide.title}
                  </p>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
