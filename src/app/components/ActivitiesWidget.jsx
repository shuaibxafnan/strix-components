"use client";

import { useEffect, useState } from "react";

// ─── ActivitiesWidget ────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// data              array     Dataset items containing text narratives and images
// maxWidgetWidth    string    640px       Maximum responsive width container bounds
// imageColumnWidth  string    220px       Visual size scale for the stacked card deck
// widgetBgColor     string    #09090b     Deep onyx background panel layout canvas tone
// cardBorderColor   string    rgba(255,255,255,0.1) Precision structural edge stroke ring
// titleColor        string    #ffffff     Primary heading typography accent tone
// textColor         string    #a1a1aa     Secondary descriptive content body string
// titleSize         string    text-2xl    Tailwind text sizing rule for headers
// textSize          string    text-sm     Tailwind text sizing rule for description body
// animationDuration string    0.66s       Runtime execution track speed for card flips
// initialIndex      number    0           Operational index tracking loop origin
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_ACTIVITIES = [
  {
    title: "Ice Catch",
    description:
      "It's like regular catch, but it's on ice so it's cooler literally. Perfect for freezing winter midnights.",
    image:
      "https://images.unsplash.com/photo-1723274565296-2945e2ebc306?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    rotation: "4deg",
  },
  {
    title: "Mud Touching",
    description:
      "Mud isn't going to touch itself. Get closer to earth textures with industrial-grade outdoor therapy.",
    image:
      "https://images.unsplash.com/photo-1607930232028-f01079639b00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    rotation: "-2deg",
  },
  {
    title: "BMX Football",
    description:
      "High velocity stadium athletics combined with heavy action extreme cycling gear. High stakes only.",
    image:
      "https://images.unsplash.com/photo-1677757103853-a304b6a182f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    rotation: "-9deg",
  },
  {
    title: "Shoe Tying",
    description:
      "I love tying shoes. Bunny style. The other bunny style. Complete technical execution of all lace variants.",
    image:
      "https://images.unsplash.com/photo-1676312830459-f6f13dfdd899?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    rotation: "7deg",
  },
];

export default function ActivitiesWidget({
  data = DEFAULT_ACTIVITIES,
  maxWidgetWidth = "640px",
  imageColumnWidth = "220px",
  widgetBgColor = "#09090b",
  cardBorderColor = "rgba(255,255,255,0.1)",
  titleColor = "#ffffff",
  textColor = "#a1a1aa",
  titleSize = "text-2xl",
  textSize = "text-sm",
  animationDuration = "0.66s",
  initialIndex = 0,
}) {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev + 1) % data.length);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev - 1 + data.length) % data.length);
  };

  const handleAnimationEnd = () => {
    setIsAnimating(false);
  };

  if (!mounted) {
    return (
      <div
        style={{ maxWidth: maxWidgetWidth }}
        className="w-full h-[280px] bg-neutral-900/30 rounded-2xl border border-white/5 animate-pulse mx-auto"
      />
    );
  }

  return (
    <div
      style={{ backgroundColor: widgetBgColor, maxWidth: maxWidgetWidth }}
      className="w-full mx-auto p-6 rounded-2xl border border-white/5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] select-none antialiased relative group"
    >
      {/* Structural Split Grid Framework */}
      <div
        style={{ gridTemplateColumns: `${imageColumnWidth} 1fr` }}
        className="grid items-center gap-8 relative min-h-[240px]"
      >
        {/* LEFT COLUMN: Expanded Stacked Deck Viewport Container */}
        <div className="relative w-full aspect-square">
          {data.map((item, idx) => {
            const isActive = idx === activeIndex;

            // Computes visual ordering: top card retains priority during execution cycles
            const computeZIndex = isActive
              ? data.length + 2
              : data.length - idx;

            return (
              <div
                key={idx}
                onAnimationEnd={isActive ? handleAnimationEnd : undefined}
                style={{
                  "--tw-rotate":
                    isAnimating && isActive ? "0deg" : item.rotation,
                  "--tw-anim-duration": animationDuration,
                  borderColor: cardBorderColor,
                  zIndex: computeZIndex,
                  transform: `rotate(var(--tw-rotate, 0deg))`,
                }}
                className={`absolute inset-0 rounded-2xl border bg-neutral-950 shadow-[0_15px_35px_rgba(0,0,0,0.65)] overflow-hidden transition-all duration-500 ease-out origin-center ${
                  isActive && isAnimating
                    ? "animate-[moveOutIn_var(--tw-anim-duration)_cubic-bezier(0.34,1.56,0.64,1)_forwards]"
                    : ""
                } ${isActive ? "scale-100 opacity-100" : "scale-95 opacity-85"}`}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover pointer-events-none transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: Static Content Text & Buttons Interface */}
        <div className="flex flex-col justify-between h-full py-2 relative">
          {/* Header Progress Counter Tag */}
          <div
            style={{ color: textColor }}
            className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase opacity-40 mb-3 flex items-center gap-1.5"
          >
            <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            INDEX // {String(activeIndex + 1).padStart(2, "0")}
          </div>

          {/* Context Display Typography Engine Section */}
          <div className="relative flex-1 min-h-[110px]">
            {data.map((item, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={idx}
                  className={`absolute inset-0 flex flex-col justify-start transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isActive
                      ? "opacity-100 translate-x-0 pointer-events-auto"
                      : "opacity-0 -translate-x-4 pointer-events-none"
                  }`}
                >
                  <h3
                    style={{ color: titleColor }}
                    className={`font-sans font-black tracking-tight mb-2 ${titleSize}`}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{ color: textColor }}
                    className={`font-sans leading-relaxed opacity-75 max-w-[340px] line-clamp-4 text-ellipsis ${textSize}`}
                  >
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Navigation Micro-Controller Vector Cluster */}
          <nav className="flex items-center gap-2 mt-6 self-start relative z-50">
            <button
              onClick={handlePrev}
              aria-label="Previous Entry"
              className="w-9 h-9 border border-white/5 rounded-xl flex items-center justify-center bg-white/[0.02] text-white hover:bg-white hover:text-black hover:border-white transition-all duration-300 ease-out active:scale-95 group/btn"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-4 h-4 transform group-hover/btn:-translate-x-0.5 transition-transform duration-200"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Entry"
              className="w-9 h-9 border border-white/5 rounded-xl flex items-center justify-center bg-white/[0.02] text-white hover:bg-white hover:text-black hover:border-white transition-all duration-300 ease-out active:scale-95 group/btn"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-4 h-4 transform group-hover/btn:translate-x-0.5 transition-transform duration-200"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>

      {/* Embedded Global CSS Keyframe Slide Swapping Driver Block */}
      <style jsx global>{`
        @keyframes moveOutIn {
          50% {
            transform: translate3d(-112%, 0, 0) scale3d(1.06, 1.06, 1)
              rotate(-6deg);
          }
          100% {
            transform: translate3d(0, 0, 0) scale3d(1, 1, 1)
              rotate(var(--tw-rotate, 0deg));
          }
        }
      `}</style>
    </div>
  );
}
