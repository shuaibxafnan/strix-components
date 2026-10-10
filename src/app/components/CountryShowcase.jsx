"use client";

import { useState, useEffect } from "react";

const DEFAULT_ITEMS = [
  {
    id: 1,
    name: "Switzerland",
    description:
      "Renowned for its breathtaking Alpine scenery and precision in craftsmanship",
    image:
      "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Finland",
    description: "Known for its saunas, lakes, and a deep connection to nature",
    image:
      "https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Iceland",
    description:
      "Famous for its stunning geothermal landscapes, waterfalls, and glaciers",
    image:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Australia",
    description:
      "Distinguished by its diverse ecosystems, ranging from beaches to the rugged outback",
    image:
      "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Netherlands",
    description:
      "Characterized by its iconic canals, tulip fields, and windmills",
    image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "Ireland",
    description:
      "Known for its lush green landscapes and rich cultural heritage",
    image:
      "https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function CountryShowcase({
  items = DEFAULT_ITEMS,
  containerWidth = "max-w-[1100px]",
  containerHeight = "h-[600px]",
  cardWidth = "w-[200px]",
  cardHeight = "h-[200px]",
  activeTransition = "duration-[550ms]",
}) {
  const [sliderItems, setSliderItems] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    setSliderItems(items);
    setMounted(true);
  }, [items]);

  const handleNext = () => {
    setSliderItems((prev) => {
      if (prev.length === 0) return prev;
      const [first, ...rest] = prev;
      return [...rest, first];
    });
    setAnimKey((k) => k + 1);
  };

  const handlePrev = () => {
    setSliderItems((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      return [last, ...prev.slice(0, -1)];
    });
    setAnimKey((k) => k + 1);
  };

  if (!mounted || sliderItems.length === 0) {
    return (
      <div className="w-full min-h-screen bg-[#eaeaea] flex items-center justify-center">
        <div
          className={`w-full ${containerWidth} ${containerHeight} bg-[#f5f5f5] animate-pulse rounded-md`}
        />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#eaeaea] relative flex items-center justify-center overflow-hidden antialiased select-none">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(60px); filter: blur(20px); }
              to   { opacity: 1; transform: translateY(0);   filter: blur(0); }
            }
            .text-anim       { animation: slideUp 0.7s ease-out forwards; }
            .text-anim-d1    { animation: slideUp 0.7s ease-out 0.2s forwards; opacity: 0; }
            .text-anim-d2    { animation: slideUp 0.7s ease-out 0.45s forwards; opacity: 0; }
          `,
        }}
      />

      <div
        className={`w-full ${containerWidth} ${containerHeight} relative overflow-visible shadow-[0_20px_60px_rgba(0,0,0,0.25)]`}
      >
        {sliderItems.map((item, index) => {
          // ── Slot definitions ──────────────────────────────────────────────
          // index 0 → background layer (full screen, z=1)
          // index 1 → foreground layer with text (full screen, z=2)
          // index 2 → standby card 1 (z=3)
          // index 3 → standby card 2 (z=4)
          // index 4 → standby card 3 (z=5)
          // index 5+ → hidden off-screen

          const isBackground = index === 0;
          const isForeground = index === 1;
          const isFullScreen = isBackground || isForeground;

          // Standby card column: 0, 1, 2 → visible; 3+ → hidden
          const col = index - 2;
          const isVisible = col >= 0 && col <= 2;
          const isHidden = col > 2;

          // Position styles per slot
          let positionStyles = "";
          let zIndexStyle = {};

          if (isFullScreen) {
            positionStyles = "top-0 left-0 w-full h-full rounded-none";
            zIndexStyle = { zIndex: isBackground ? 1 : 2 };
          } else if (isVisible || isHidden) {
            positionStyles = `${cardWidth} ${cardHeight} top-1/2 -translate-y-1/2 rounded-md`;
            zIndexStyle = { zIndex: 3 + col };
          }

          // Horizontal position for standby cards
          const cardLeftStyle = !isFullScreen
            ? {
                left: `calc(50% + ${col * 216}px)`,
                opacity: isHidden ? 0 : 1,
                pointerEvents: isHidden ? "none" : "auto",
              }
            : {};

          return (
            <div
              key={item.id}
              className={`absolute ${positionStyles} ${activeTransition} ease-[cubic-bezier(0.4,0,0.2,1)] bg-center bg-cover bg-no-repeat transition-all`}
              style={{
                backgroundImage: `url('${item.image}')`,
                ...zIndexStyle,
                ...cardLeftStyle,
              }}
            >
              {/* Dim overlay on full-screen slots */}
              {isFullScreen && (
                <div className="absolute inset-0 bg-black/38 pointer-events-none" />
              )}

              {/* Text block — foreground slot only */}
              {isForeground && (
                <div
                  key={animKey}
                  className="absolute top-1/2 left-20 -translate-y-1/2 text-white max-w-[280px] font-sans z-10"
                >
                  <div className="text-[36px] uppercase font-bold leading-tight tracking-wide text-anim">
                    {item.name}
                  </div>
                  <p className="mt-2.5 mb-0 text-[13px] leading-relaxed text-white/85 text-anim-d1">
                    {item.description}
                  </p>
                  <button className="mt-4 px-5 py-2.5 text-sm font-medium text-white border border-white/60 rounded-md bg-white/15 backdrop-blur-sm hover:bg-white/30 hover:border-white/90 transition-all duration-200 active:scale-95 text-anim-d2">
                    See More
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* ── Navigation buttons ── */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
          <button
            onClick={handlePrev}
            aria-label="Previous"
            className="w-11 h-11 rounded-full bg-white/15 border border-white/50 text-white backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:bg-white/30 hover:border-white/90 active:scale-90"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
          </button>
          <button
            onClick={handleNext}
            aria-label="Next"
            className="w-11 h-11 rounded-full bg-white/15 border border-white/50 text-white backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:bg-white/30 hover:border-white/90 active:scale-90"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
