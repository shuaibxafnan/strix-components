"use client";

import { useEffect, useState } from "react";

// ─── PerspectiveGallery ───────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor            string   "#0b0c10"          Deep minimalist charcoal layout canvas
// cardWidth          string   "500px"            Square proportional desktop base width
// cardHeight         string   "500px"            Matching height parameter for clean square blocks
// accentColor        string   "#ffffff"          Subtle crisp interactive highlight tint
// transitionTime     number   700                Silky smooth travel timeline speed (ms)
// scaleReduction     number   0.12               Dimensional scaling decay multiplier per layer depth
// translateXOffset    number   150                Horizontal step separation distance (px)
// repeat             boolean  true               Loop layout toggle switch flag
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_SLIDES = [
  {
    id: 1,
    img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800",
    title: "Eiger Nordwand",
    serial: "01 // ALPS",
    description:
      "An approach through the classic Bernese Oberland climbing routes.",
  },
  {
    id: 2,
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800",
    title: "Source d'Argent",
    serial: "02 // SEYC",
    description:
      "Sculpted granite boulders shaping the pristine shorelines of La Digue.",
  },
  {
    id: 3,
    img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800",
    title: "Fitz Roy Expedition",
    serial: "03 // PATG",
    description:
      "Navigating the unpredictable weather systems of Southern Patagonia.",
  },
  {
    id: 4,
    img: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&q=80&w=800",
    title: "Banzai Pipeline",
    serial: "04 // HAWN",
    description:
      "The raw geometry of winter groundswells hitting the North Shore.",
  },
  {
    id: 5,
    img: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=800",
    title: "Black Forest",
    serial: "05 // DEUT",
    description:
      "Dense pine canopies captured during the brief alpine spring melt.",
  },
  {
    id: 6,
    img: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=800",
    title: "Yosemite Valley Rim",
    serial: "06 // YSEM",
    description:
      "Granite walls catching the final light above the Merced River valley.",
  },
];

export default function PerspectiveGallery({
  bgColor = "#0b0c10",
  cardWidth = "500px",
  cardHeight = "500px",
  accentColor = "#ffffff",
  transitionTime = 700,
  scaleReduction = 0.12,
  translateXOffset = 150,
  repeat = true,
  slides = DEFAULT_SLIDES,
}) {
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="w-full h-screen flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      />
    );
  }

  const slideTotal = slides.length;

  const handleNext = () => {
    if (currentIndex < slideTotal - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (repeat) {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else if (repeat) {
      setCurrentIndex(slideTotal - 1);
    }
  };

  const getSlideState = (idx) => {
    if (idx === currentIndex) return "active";

    let diff = idx - currentIndex;
    if (repeat) {
      if (diff < -1 && diff === -(slideTotal - 1)) diff = 1;
      if (diff > 1 && diff === slideTotal - 1) diff = -1;
    }

    if (diff === -1) return "preactive";
    if (diff === 1) return "proactive";
    if (diff < -1) return "preactivede";
    if (diff > 1) return "proactivede";
    return "hidden";
  };

  const getDynamicStyles = (state) => {
    const commonTransition = `all ${transitionTime}ms cubic-bezier(0.2, 0.8, 0.2, 1)`;

    switch (state) {
      case "active":
        return {
          transform: "translateX(0%) scale(1) rotate(0deg)",
          opacity: 1,
          zIndex: 30,
          pointerEvents: "auto",
          transition: commonTransition,
        };
      case "preactive":
        return {
          transform: `translateX(-${translateXOffset}px) scale(${1 - scaleReduction}) rotate(-1.5deg)`,
          opacity: 0.3,
          zIndex: 20,
          pointerEvents: "none",
          transition: commonTransition,
        };
      case "proactive":
        return {
          transform: `translateX(${translateXOffset}px) scale(${1 - scaleReduction}) rotate(1.5deg)`,
          opacity: 0.3,
          zIndex: 20,
          pointerEvents: "none",
          transition: commonTransition,
        };
      case "preactivede":
        return {
          transform: `translateX(-${translateXOffset * 1.4}px) scale(${1 - scaleReduction * 2}) rotate(-3deg)`,
          opacity: 0,
          zIndex: 10,
          pointerEvents: "none",
          transition: commonTransition,
        };
      case "proactivede":
        return {
          transform: `translateX(${translateXOffset * 1.4}px) scale(${1 - scaleReduction * 2}) rotate(3deg)`,
          opacity: 0,
          zIndex: 10,
          pointerEvents: "none",
          transition: commonTransition,
        };
      default:
        return {
          transform: "translateX(0%) scale(0)",
          opacity: 0,
          zIndex: 0,
          pointerEvents: "none",
          transition: commonTransition,
        };
    }
  };

  return (
    <div
      className="w-full h-screen flex items-center justify-center overflow-hidden relative font-sans antialiased"
      style={{ backgroundColor: bgColor }}
    >
      {/* Structural Centralized Gallery Viewport Wrapper */}
      <div className="absolute inset-0 flex items-center justify-center w-full max-w-[1440px] mx-auto px-6">
        {/* Editorial Left Arrow Link */}
        {!repeat && currentIndex === 0 ? null : (
          <button
            onClick={handlePrev}
            aria-label="Back"
            className="absolute left-8 lg:left-16 z-50 text-white/40 hover:text-white transition-colors duration-300 p-2 group hidden sm:block"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 transition-transform duration-300 group-hover:-translate-x-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
          </button>
        )}

        {/* Master Deck Node Layer Container */}
        <div className="relative flex items-center justify-center w-full h-full">
          {slides.map((slide, idx) => {
            const state = getSlideState(idx);
            const dynamicStyles = getDynamicStyles(state);
            const isActive = state === "active";

            return (
              <div
                key={slide.id}
                style={{
                  width: cardWidth,
                  height: cardHeight,
                  ...dynamicStyles,
                }}
                className="absolute origin-center overflow-hidden bg-[#12141c] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.9)] group"
              >
                {/* Structural Clean Inner Mounting Frame */}
                <div className="w-full h-full relative overflow-hidden">
                  <img
                    src={slide.img}
                    alt={slide.title}
                    className="absolute inset-0 w-full h-full object-cover grayscale-[20%] opacity-90 scale-100 transition-transform duration-[1200ms] cubic-bezier(0.16, 1, 0.3, 1) group-hover:scale-102"
                  />

                  {/* Deep Soft Atmospheric Dark Gradation Shield */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 opacity-90" />

                  {/* Asymmetric Editorial Content Layout Panel */}
                  <div
                    className={`absolute inset-0 p-10 flex flex-col justify-between transition-all duration-700 ease-out transform ${
                      isActive
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    }`}
                  >
                    {/* Top Floor Row: Serial Track */}
                    <div className="text-left">
                      <span className="text-[11px] font-medium tracking-[0.25em] text-white/40 uppercase font-mono">
                        {slide.serial}
                      </span>
                    </div>

                    {/* Bottom Floor Section: Asymmetrical Typography Stack */}
                    <div className="space-y-4 text-left max-w-[85%]">
                      <div className="space-y-1">
                        <h3 className="text-3xl font-light text-white tracking-tight leading-none font-serif">
                          {slide.title}
                        </h3>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed font-light tracking-wide">
                        {slide.description}
                      </p>

                      <div className="pt-2">
                        <button className="inline-flex items-center gap-4 text-[10px] font-semibold text-white/50 hover:text-white uppercase tracking-[0.2em] transition-colors duration-300 group/btn">
                          View Case
                          <span className="w-6 h-px bg-white/20 transition-all duration-300 group-hover/btn:w-10 group-hover/btn:bg-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Editorial Right Arrow Link */}
        {!repeat && currentIndex === slideTotal - 1 ? null : (
          <button
            onClick={handleNext}
            aria-label="Forward"
            className="absolute right-8 lg:right-16 z-50 text-white/40 hover:text-white transition-colors duration-300 p-2 group hidden sm:block"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 transition-transform duration-300 group-hover:translate-x-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
