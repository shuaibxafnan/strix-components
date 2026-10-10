"use client";

import { useEffect, useRef, useState } from "react";

// ─── PrecisionGallery ────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// items            array     List of image nodes { id, color, title, desc, src }
// defaultBg        string    Initial background color
// imageWidthClass  string    Tailwind width for each card
// imageHeightClass string    Tailwind height for each card
// gapClass         string    Tailwind right-margin between cards
// showHeader       boolean   Toggle top header
// showCounter      boolean   Toggle bottom-right counter
// showSwipeCue     boolean   Toggle swipe hint
// speedClass       string    Tailwind transition-duration for bg color
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_GALLERY_ITEMS = [
  {
    id: 1,
    color: "#f1bace",
    title: "Minimalist Bloom",
    desc: "Exploration of pastel natural palettes.",
    src: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80",
  },
  {
    id: 2,
    color: "#ffbc00",
    title: "Citrus Punch",
    desc: "Bold studio macro-photography.",
    src: "https://images.unsplash.com/photo-1516085216930-c93a002a8b01?ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80",
  },
  {
    id: 3,
    color: "#cfdfde",
    title: "Nordic Clean",
    desc: "Architectural composition balances.",
    src: "https://images.unsplash.com/photo-1458819714733-e5ab3d536722?ixlib=rb-1.2.1&auto=format&fit=crop&w=933&q=80",
  },
  {
    id: 4,
    color: "#3c94c5",
    title: "Ocean Breeze",
    desc: "Stunning aerial shoreline abstracts.",
    src: "https://images.unsplash.com/photo-1520013817300-1f4c1cb245ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=2287&q=80",
  },
  {
    id: 5,
    color: "#99aba0",
    title: "Sage Serenity",
    desc: "Interior spaces merging with outdoors.",
    src: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?ixlib=rb-1.2.1&auto=format&fit=crop&w=2247&q=80",
  },
  {
    id: 6,
    color: "#b0e6db",
    title: "Ethereal Mint",
    desc: "High-fashion avant-garde framing.",
    src: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1300&q=80",
  },
  {
    id: 7,
    color: "#fe6f62",
    title: "Crimson Horizon",
    desc: "Saturated color theory experiments.",
    src: "https://images.unsplash.com/photo-1560393464-5c69a73c5770?ixlib=rb-1.2.1&auto=format&fit=crop&w=1301&q=80",
  },
];

export default function PrecisionGallery({
  items = DEFAULT_GALLERY_ITEMS,
  defaultBg = "#f1bace",
  imageWidthClass = "w-[75vw] sm:w-[50vw] md:w-[38vw]",
  imageHeightClass = "h-[50vh] md:h-[65vh]",
  gapClass = "mr-6 md:mr-10",
  showHeader = true,
  showCounter = true,
  showSwipeCue = true,
  speedClass = "duration-[600ms]",
}) {
  const scrollContainerRef = useRef(null);
  const [currentBg, setCurrentBg] = useState(defaultBg);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    // Observe the card wrappers (divs), not imgs, so we get the full card geometry
    const cardElements = container.querySelectorAll("[data-card-index]");
    const ratioMap = new Map();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = parseInt(
            entry.target.getAttribute("data-card-index"),
            10,
          );
          ratioMap.set(idx, {
            color: entry.target.getAttribute("data-card-color"),
            ratio: entry.intersectionRatio,
          });
        });

        // The card with the highest intersection ratio in the observed zone wins
        let bestIdx = -1;
        let bestRatio = -1;
        ratioMap.forEach((val, idx) => {
          if (val.ratio > bestRatio) {
            bestRatio = val.ratio;
            bestIdx = idx;
          }
        });

        if (bestIdx >= 0 && bestRatio > 0) {
          setCurrentBg(ratioMap.get(bestIdx).color);
          setActiveIndex(bestIdx);
        }
      },
      {
        root: container,
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        // Key fix for last slide: use a much smaller right clip (-10%) so the last card
        // enters the zone well before the user hits the scroll end. Previously -45% meant
        // a 38vw-wide card had to travel 55vw into the container before registering —
        // the last card simply ran out of scroll room before that could happen.
        rootMargin: "0px -10% 0px 0px",
      },
    );

    cardElements.forEach((el) => observer.observe(el));

    // Seed
    setCurrentBg(items[0].color);
    setActiveIndex(0);
    ratioMap.set(0, { color: items[0].color, ratio: 1 });

    return () => {
      cardElements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [isClient, items]);

  if (!isClient) {
    return (
      <div className="w-full h-screen" style={{ backgroundColor: defaultBg }} />
    );
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center overflow-hidden select-none relative">
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Header */}
      {showHeader && (
        <header className="absolute top-0 left-0 w-full z-40 px-6 py-6 md:px-12 md:py-8 flex justify-between items-center mix-blend-difference text-white pointer-events-none">
          <span className="font-sans font-black text-lg md:text-xl tracking-widest uppercase">
            EXPOSURE.
          </span>
          <span className="font-mono text-[10px] md:text-xs tracking-widest opacity-50">
            GALLERY CONTEXT SCROLL
          </span>
        </header>
      )}

      {/* Horizontal scroller */}
      <section
        ref={scrollContainerRef}
        className={`no-scrollbar w-full h-full pl-12 relative whitespace-nowrap overflow-x-auto overflow-y-hidden scroll-smooth transition-colors ${speedClass} ease-out flex items-center`}
        style={{ backgroundColor: currentBg }}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            data-card-index={index}
            data-card-color={item.color}
            className={`
              inline-flex flex-col justify-center relative flex-shrink-0 group
              ${imageWidthClass} ${gapClass}
            `}
          >
            {/* Image + caption container */}
            <div
              className={`${imageHeightClass} w-full relative overflow-hidden rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.22)] transition-transform duration-700 ease-out group-hover:scale-[1.015]`}
            >
              {/* Image — always visible, no reveal animation */}
              <img
                src={item.src}
                alt={item.title}
                className="w-full h-full object-cover object-center"
              />

              {/* White caption box — bottom-left inside the card */}
              <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg px-4 py-3 max-w-[75%] shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
                <h3 className="font-sans font-bold text-sm md:text-base leading-tight tracking-tight text-neutral-900 mb-0.5">
                  {item.title}
                </h3>
                <p className="font-sans text-[10px] md:text-xs text-neutral-500 font-medium leading-snug">
                  {item.desc}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Ghost spacer — same width as one card, gives the last real card
            enough scroll runway to reach the observer zone on the left.
            Invisible, non-interactive, never observed. */}
        <div
          aria-hidden="true"
          className={`inline-flex flex-shrink-0 ${imageWidthClass} ${gapClass} pointer-events-none`}
        />
      </section>

      {/* Counter */}
      {showCounter && (
        <footer className="absolute bottom-6 right-6 md:right-12 z-40 flex items-center">
          <div className="font-mono font-bold text-xs md:text-sm tracking-widest">
            <span className="text-black/70">
              {String(activeIndex + 1).padStart(2, "0")}
            </span>
            <span className="mx-1.5 text-black/20">/</span>
            <span className="text-black/30">
              {String(items.length).padStart(2, "0")}
            </span>
          </div>
        </footer>
      )}

      {/* Swipe cue */}
      {showSwipeCue && (
        <div className="absolute bottom-[3.5rem] right-6 md:right-12 z-40 flex items-center gap-1.5 font-mono text-[9px] md:text-[10px] text-black/30 pointer-events-none animate-pulse tracking-widest uppercase">
          <span>Drag</span>
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
