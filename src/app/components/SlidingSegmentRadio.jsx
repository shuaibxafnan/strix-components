"use client";

import { useEffect, useRef, useState } from "react";

// ─── SlidingSegmentedRadio ──────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// style            'hop' | 'anchor'  Animation style paradigm
// duration         number            Transition length in seconds (e.g. 0.2)
// variants         number            How many items to render (min 2, max 7)
// theme            'light' | 'dark'  Explicitly force color variations
// match            boolean           Hop-exclusive: match previous scale size
// wrap             boolean           Hop-exclusive: bounce-wrap boundaries
// knockout         'filter'|'mask'|'none' Anchor-exclusive: transparency strategy
// initialIndex     number            Starting index selection (0-indexed)
// options          string[]          Array of string values to render
// ──────────────────────────────────────────────────────────────────────────

export default function SlidingSegmentedRadio({
  style = "hop",
  duration = 0.2,
  variants = 5,
  theme = "dark",
  match = true,
  wrap = true,
  knockout = "filter",
  initialIndex = 0,
  options = ["128GB", "256GB", "512GB", "1TB", "2TB", "4TB", "8TB"],
}) {
  const containerRef = useRef(null);
  const labelsRef = useRef([]);

  // Selection states
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [previousIndex, setPreviousIndex] = useState(null);

  // Layout caching initialized to empty safely preventing SSR / Hydration mismatch
  const [positions, setPositions] = useState([]);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [svgMaskHtml, setSvgMaskHtml] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Slice parameters according to current variant limitations
  const activeOptions = options.slice(
    0,
    Math.max(2, Math.min(variants, options.length)),
  );

  // Safely signal client mounting phase to trigger initial bounding checks safely
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Recalculate dimensions & SVG shapes when selections or layout bounds change on client
  useEffect(() => {
    if (!isMounted || !containerRef.current) return;

    const fieldsEl = containerRef.current.querySelector(".fields-wrapper");
    if (!fieldsEl) return;

    // Use requestAnimationFrame to ensure layout paints have finalized before reading bounding rects
    const animFrameId = requestAnimationFrame(() => {
      const containerRect = fieldsEl.getBoundingClientRect();
      setContainerDimensions({
        width: fieldsEl.offsetWidth,
        height: fieldsEl.offsetHeight,
      });

      const newPositions = activeOptions.map((_, i) => {
        const label = labelsRef.current[i];
        if (!label) return { width: 0, height: 0, left: 0, top: 0 };
        const rect = label.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          left: rect.left - containerRect.left,
          top: rect.top - containerRect.top,
        };
      });

      setPositions(newPositions);

      // Compute dynamic SVG mask dimensions for masked background styles
      if (style === "anchor") {
        const maskString = activeOptions
          .map((_, i) => {
            const label = labelsRef.current[i];
            if (!label) return "";
            const rect = label.getBoundingClientRect();
            const x = rect.left - containerRect.left;
            const y = rect.top - containerRect.top;
            return `<rect x="${x}" y="${y}" width="${rect.width}" height="${rect.height}" rx="${rect.height * 0.5}" ry="${rect.height * 0.5}" fill="#000"></rect>`;
          })
          .join("");
        setSvgMaskHtml(maskString);
      }
    });

    return () => cancelAnimationFrame(animFrameId);
  }, [currentIndex, variants, style, activeOptions.length, isMounted]);

  // Handle radio option updates
  const handleRadioChange = (index) => {
    setPreviousIndex(currentIndex);
    setCurrentIndex(index);
  };

  // Compute calculated dimensions safely for styles injection
  const currentPillWidth = positions[currentIndex]?.width || 0;
  const previousPillWidth =
    previousIndex !== null ? positions[previousIndex]?.width || 0 : 0;
  const maxPillWidth = Math.max(currentPillWidth, previousPillWidth);

  // Dynamic values injected via standard style maps
  const activePositionStyle = positions[currentIndex]
    ? {
        left: `${positions[currentIndex].left}px`,
        top: `${positions[currentIndex].top}px`,
        width: `${positions[currentIndex].width}px`,
        height: `${positions[currentIndex].height}px`,
        transitionDuration: `${duration}s`,
      }
    : {};

  const encodedSvgMask = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${containerDimensions.width} ${containerDimensions.height}">${svgMaskHtml}</svg>`,
  )
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");

  const svgMaskInlineStyle =
    knockout === "mask" && style === "anchor"
      ? {
          maskImage: `url(data:image/svg+xml;utf8,${encodedSvgMask})`,
          WebkitMaskImage: `url(data:image/svg+xml;utf8,${encodedSvgMask})`,
        }
      : {};

  // Theme styles lookup maps
  const isDark = theme === "dark";
  const bgThemeClass = isDark ? "bg-black text-white" : "bg-white text-black";
  const labelActiveThemeClass = isDark
    ? "bg-white text-black"
    : "bg-black text-white";
  const labelBorderColor = isDark ? "border-white/20" : "border-black/20";
  const hoverBackground = isDark ? "hover:bg-white/10" : "hover:bg-black/5";

  return (
    <div
      ref={containerRef}
      className={`relative p-8 font-mono select-none w-[360px] h-[195px] overflow-auto border rounded-xl ${bgThemeClass} ${isDark ? "border-neutral-800" : "border-neutral-200"}`}
    >
      {/* Knockout SVG filters explicitly injected for anchor knockout styles */}
      <svg
        className="absolute w-0 h-0 pointer-events-none invisible"
        aria-hidden="true"
      >
        <defs>
          <filter id="knockout-black" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -1 -1 -1 0 1"
            />
            <feComposite in="SourceGraphic" operator="out" />
          </filter>
          <filter id="knockout-white" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  1 1 1 0 0"
            />
            <feComposite in="SourceGraphic" operator="out" />
          </filter>
        </defs>
      </svg>

      <div className="fields-wrapper relative flex flex-col">
        {/* Anchor Mode Active Indicator Pill Overlay */}
        {style === "anchor" && positions[currentIndex] && (
          <div
            className={`absolute rounded-full pointer-events-none z-0 transition-all ease-out ${isDark ? "bg-white" : "bg-black"}`}
            style={activePositionStyle}
          />
        )}

        <fieldset className="border-0 m-0 p-0 flex flex-wrap gap-2 relative z-10">
          <legend className="text-xs font-light tracking-wider uppercase mb-2 ml-1 opacity-70">
            Capacity
          </legend>

          <div className="flex flex-wrap gap-2">
            {activeOptions.map((option, i) => {
              const isChecked = currentIndex === i;
              const isPrevious = previousIndex === i;

              // Structural dynamic configurations for HOP mode transformations
              let hopTranslationClass = "translate-x-0";
              if (style === "hop") {
                if (!isChecked && previousIndex !== null && i < currentIndex) {
                  hopTranslationClass = "translate-x-full";
                }
                if (i > currentIndex) {
                  hopTranslationClass = "-translate-x-full";
                }
              }

              // Evaluate boundary state wrapping logic
              if (style === "hop" && wrap && activeOptions.length >= 3) {
                if (
                  currentIndex === 0 &&
                  i === activeOptions.length - 1 &&
                  previousIndex !== null
                ) {
                  hopTranslationClass = "translate-x-full";
                }
                if (currentIndex === activeOptions.length - 1 && i === 0) {
                  hopTranslationClass = "-translate-x-full";
                }
              }

              // Width logic calculations injected mapping to match attributes
              const hopInlineStyles =
                style === "hop"
                  ? {
                      width: match ? `${maxPillWidth}px` : "100%",
                      transitionDuration: `${duration}s`,
                    }
                  : {};

              return (
                <div
                  key={option}
                  className="relative inline-block overflow-hidden rounded-full"
                >
                  <label
                    ref={(el) => {
                      labelsRef.current[i] = el;
                    }}
                    htmlFor={`radio-${option}`}
                    className={`
                      relative block px-4 py-2 text-sm font-medium border rounded-full cursor-pointer overflow-hidden z-10 transition-colors duration-200
                      ${labelBorderColor} ${hoverBackground}
                      ${style === "anchor" && isChecked ? "bg-transparent text-transparent pointer-events-none" : ""}
                      ${style === "hop" && isChecked ? labelActiveThemeClass : ""}
                    `}
                  >
                    <span className="relative z-20">{option}</span>

                    {/* Sliding internal background masking layer specific to hop transitions */}
                    {style === "hop" && (isChecked || isPrevious) && (
                      <span
                        className={`absolute inset-0 rounded-full z-0 transition-transform ease-out ${hopTranslationClass} ${
                          isDark ? "bg-white" : "bg-black"
                        }`}
                        style={hopInlineStyles}
                      />
                    )}
                  </label>

                  <input
                    type="radio"
                    name="capacity-group"
                    id={`radio-${option}`}
                    value={option}
                    checked={isChecked}
                    onChange={() => handleRadioChange(i)}
                    className="absolute opacity-0 scale-0 pointer-events-none"
                    aria-label={option}
                  />
                </div>
              );
            })}
          </div>
        </fieldset>

        {/* Anchor Mode Filter Overlay Knockout Layer */}
        {style === "anchor" && knockout !== "none" && (
          <fieldset
            aria-hidden="true"
            className="absolute inset-0 top-6 m-0 p-0 flex flex-wrap gap-2 pointer-events-none z-20"
            style={{
              filter:
                knockout === "filter"
                  ? `url(#knockout-${isDark ? "white" : "black"})`
                  : "none",
              ...svgMaskInlineStyle,
            }}
          >
            <legend className="text-xs opacity-0 mb-2 invisible">
              Capacity
            </legend>
            <div
              className={`flex flex-wrap gap-2 w-full h-full p-1 rounded-xl ${isDark ? "bg-black" : "bg-white"}`}
            >
              {activeOptions.map((option) => (
                <label
                  key={`mask-${option}`}
                  className={`px-4 py-2 text-sm font-medium border rounded-full ${
                    isDark
                      ? "bg-white border-white text-black"
                      : "bg-black border-black text-white"
                  }`}
                >
                  {option}
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </div>
    </div>
  );
}
