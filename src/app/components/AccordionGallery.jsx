"use client";

import { useEffect, useState } from "react";

// ─── ExpandingAccordionGrid ──────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// items            array    []       List of image objects (e.g., [{ id: 41, src: "..." }])
// gridBgColor      string   "#f0f0f0" Main page/container background
// cardBgColor      string   "#ffffff" Individual inner card container background
// maxContainerWidth string   "1440px"  Maximum width constraint for the gallery grid
// containerPadding string   "0 3rem"  Left and right padding for the outer layout
// cardMinPercent   number   1        The base width fallback value for unhovered items (%)
// cardActivePercent number  30       The target layout expansion scale on hover (%)
// cardHeightMobile number   400      Static aspect ratio container layout height for mobile (px)
// cardHeightDesktop number  600      Static aspect ratio container layout height for desktop (px)
// transitionSpeed  number   600      Accordion panel layout animation timing duration (ms)
// initialOpacity   number   0.2      The layout transparency matrix value when out of focus
// ──────────────────────────────────────────────────────────────────────────

// Fallback high-quality placeholder landscape mock data array values
const DEFAULT_ITEMS = [
  { id: "41", src: "https://picsum.photos/id/41/800/800" },
  { id: "42", src: "https://picsum.photos/id/42/800/800" },
  { id: "33", src: "https://picsum.photos/id/33/800/800" },
  { id: "24", src: "https://picsum.photos/id/24/800/800" },
  { id: "25", src: "https://picsum.photos/id/25/800/800" },
  { id: "26", src: "https://picsum.photos/id/26/800/800" },
  { id: "27", src: "https://picsum.photos/id/27/800/800" },
  { id: "28", src: "https://picsum.photos/id/28/800/800" },
  { id: "29", src: "https://picsum.photos/id/29/800/800" },
  { id: "22", src: "https://picsum.photos/id/22/800/800" },
];

export default function AccordionGallery({
  items = DEFAULT_ITEMS,
  gridBgColor = "#f0f0f0",
  cardBgColor = "#ffffff",
  maxContainerWidth = "1440px",
  containerPadding = "0 3rem",
  cardMinPercent = 1,
  cardActivePercent = 30,
  cardHeightMobile = 400,
  cardHeightDesktop = 600,
  transitionSpeed = 600,
  initialOpacity = 0.2,
}) {
  // Track currently active highlighted card index state tracker
  // Initialized to null to cleanly support fallback initial load configuration arrays
  const [activeIndex, setActiveIndex] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent client-side hydration mismatch values on the window width layout rules
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Utility logic parser mapping vertical margin structural alignment offsets safely across specific elements
  const getMarginTopClass = (index) => {
    const position = index + 1;

    // Explicit static maps mimicking pure nth-child structural definitions
    const mapZero = [2, 5, 9];
    const mapTwoHalf = [2, 4, 6, 8, 10];
    const mapFive = [3, 7];

    if (mapZero.includes(position) && mapTwoHalf.includes(position)) {
      // Overlapping rules handled explicitly down the Cascade layout logic
      return "mt-[2.5%]";
    }
    if (mapZero.includes(position)) return "mt-0";
    if (mapTwoHalf.includes(position)) return "mt-[2.5%]";
    if (mapFive.includes(position)) return "mt-[5%]";

    return "mt-0";
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center m-0 font-sans select-none antialiased"
      style={{ backgroundColor: gridBgColor }}
    >
      <div
        className="w-full flex items-start justify-center overflow-auto my-0 mx-auto"
        style={{
          maxWidth: maxContainerWidth,
          padding: containerPadding,
        }}
        onMouseLeave={() => setActiveIndex(null)}
      >
        {items.map((item, index) => {
          // Dynamic conditional check to ascertain if card opacity should flag fully illuminated states
          const isCurrentActive = activeIndex === index;
          const isGlobalDefault = activeIndex === null;
          const showFullOpacity = isCurrentActive || isGlobalDefault;

          return (
            <div
              key={item.id || index}
              className={`relative flex-grow flex-shrink group transition-all ease-[cubic-bezier(0.25,1,0.5,1)] ${getMarginTopClass(index)}`}
              style={{
                // Base proportional properties calculations driven by runtime props configuration parameters
                flexBasis: isCurrentActive
                  ? `${cardActivePercent}%`
                  : `${cardMinPercent}%`,
                opacity: showFullOpacity ? 1 : initialOpacity,
                transitionDuration: `${transitionSpeed}ms`,
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <div
                className="m-1 rounded-lg flex justify-center items-center overflow-hidden shadow-sm"
                style={{ backgroundColor: cardBgColor }}
              >
                <picture
                  className="w-full h-0 relative overflow-hidden block"
                  style={{
                    // Contextual fallback mapping rendering custom configuration specs safely onto the aspect canvas
                    paddingBottom:
                      typeof window !== "undefined" && window.innerWidth < 768
                        ? `${cardHeightMobile}px`
                        : `${cardHeightDesktop}px`,
                  }}
                >
                  <img
                    src={item.src}
                    alt={item.alt || ""}
                    className="absolute top-0 left-0 w-full h-full object-cover object-center pointer-events-none select-none transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </picture>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
