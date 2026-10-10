"use client";

import { useEffect, useRef, useState } from "react";

// ─── PlanetSlider ─────────────────────────────────────────────────────────────
//
// A split-panel vertical slider. The left panel (text) slides down while the
// right panel (image) slides up — mirrored translateY on the same click.
// Identical slide-change math to the original vanilla JS pen.
//
// Props
// ──────────────────────────────────────────────────────────────────────────────
// slides           object[]   (see DEFAULTS)   Array of slide data objects, each:
//                                               { title, subtitle, body, image, accent }
//                                               • title    — large display heading
//                                               • subtitle — small eyebrow label above title
//                                               • body     — one-line stat / description
//                                               • image    — full-bleed background URL
//                                               • accent   — hex color for index watermark
//                                                            + left-border rule
// splitRatio       number     35               Left panel width as % of total
// transitionMs     number     500              Slide transition duration in ms
// leftBg           string     "#0d0d0d"        Left panel background color
// leftTextColor    string     "#e8e8e8"        Left panel primary text color
// leftMutedColor   string     "#555555"        Left panel muted/secondary text color
// fontFamily       string     "Sometype Mono"  Google Font name (monospace feel)
// showCounter      bool       true             Show "01 / 04" counter in nav
// ──────────────────────────────────────────────────────────────────────────────

const DEFAULT_SLIDES = [
  {
    title: "Earth",
    subtitle: "Third planet",
    body: "Mass — 5.972 × 10²⁴ kg",
    image:
      "https://images.unsplash.com/photo-1614314107768-6018061b5b72?auto=format&fit=crop&q=80&w=1374",
    accent: "#6ab4c8",
  },
  {
    title: "Saturn",
    subtitle: "Sixth planet",
    body: "Mass — 5.683 × 10²⁶ kg",
    image:
      "https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?auto=format&fit=crop&q=80&w=1374",
    accent: "#c8c46a",
  },
  {
    title: "Neptune",
    subtitle: "Eighth planet",
    body: "Mass — 1.024 × 10²⁶ kg",
    image:
      "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&q=80&w=1374",
    accent: "#8485d6",
  },
  {
    title: "Pluto",
    subtitle: "Dwarf planet",
    body: "Mass — 1.303 × 10²² kg",
    image:
      "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&q=80&w=1374",
    accent: "#c09a7a",
  },
];

export default function VerticalSplitSlider({
  slides = DEFAULT_SLIDES,
  splitRatio = 35,
  transitionMs = 500,
  leftBg = "#0d0d0d",
  leftTextColor = "#e8e8e8",
  leftMutedColor = "#555555",
  fontFamily = "Sometype Mono",
  showCounter = true,
}) {
  // Active slide index — drives the translateY calculations on both panels
  const [activeIndex, setActiveIndex] = useState(0);

  const leftRef = useRef(null);
  const rightRef = useRef(null);

  const total = slides.length;

  // ── Initial offset: left panel starts shifted up so only slide[0] is visible.
  // Each text-div is 100vh tall; to show slide[0] the left strip must begin at
  // -(total - 1) * 100vh  (same as the original's `slideLeft.style.top`).
  // We set this once as a CSS custom property so the translateY in changeSlide
  // is additive on top of it — cleaner than managing combined px values.
  useEffect(() => {
    const left = leftRef.current;
    if (!left) return;
    // Baseline top offset so slide[0] text is visible on mount
    left.style.top = `-${(total - 1) * 100}vh`;
  }, [total]);

  // ── Slide transition — mirrors original changeSlide() exactly ────────────
  function changeSlide(direction) {
    setActiveIndex((prev) => {
      let next = prev;
      if (direction === "up") {
        next = prev + 1 >= total ? 0 : prev + 1;
      } else {
        next = prev - 1 < 0 ? total - 1 : prev - 1;
      }

      const sliderHeight =
        leftRef.current?.closest(".ps-container")?.clientHeight ??
        window.innerHeight;

      // Right panel slides UP (negative translateY)
      if (rightRef.current) {
        rightRef.current.style.transform = `translateY(-${next * sliderHeight}px)`;
      }
      // Left panel slides DOWN (positive translateY) — counters the initial top offset
      if (leftRef.current) {
        leftRef.current.style.transform = `translateY(${next * sliderHeight}px)`;
      }

      return next;
    });
  }

  // Derived accent for the active slide
  const accent = slides[activeIndex]?.accent ?? "#888";

  // Pad index for counter display e.g. "01"
  const pad = (n) => String(n + 1).padStart(2, "0");

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* Google Font import — scoped style tag, no external dependency on _document */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;700&display=swap');

        .ps-left-panel,
        .ps-right-panel {
          transition: transform ${transitionMs}ms ease-in-out;
        }

        /* Thin left-border accent rule that transitions with the active slide color */
        .ps-accent-rule {
          transition: border-color ${transitionMs}ms ease-in-out,
                      color        ${transitionMs}ms ease-in-out;
        }

        /* Watermark index number behind text content */
        .ps-watermark {
          transition: color ${transitionMs}ms ease-in-out,
                      opacity ${transitionMs}ms ease-in-out;
        }

        /* Button hover state — can't use Tailwind hover for runtime color */
        .ps-nav-btn:hover {
          background-color: rgba(255,255,255,0.12);
        }
        .ps-nav-btn:focus {
          outline: none;
        }
        .ps-nav-btn:active {
          transform: scale(0.94);
        }
      `}</style>

      {/*
       * Root container: full viewport, overflow hidden, relative so the
       * absolute-positioned panels and nav button stay contained.
       * font-family is a runtime prop — inline style required.
       */}
      <div
        className="ps-container relative w-screen h-screen overflow-hidden"
        style={{ fontFamily: `'${fontFamily}', monospace` }}
      >
        {/* ── Left panel — text stack ──────────────────────────────────────── */}
        {/*
         * position:absolute, height:100%, width = splitRatio%.
         * All slide divs stacked vertically (each 100vh tall).
         * Initial top = -(total-1)*100vh set via useEffect.
         * translateY on click moves the strip down to reveal each slide.
         * splitRatio and leftBg are runtime props → inline style.
         */}
        <div
          ref={leftRef}
          className="ps-left-panel absolute top-0 left-0 h-full"
          style={{
            width: `${splitRatio}%`,
            backgroundColor: leftBg,
          }}
        >
          {slides.map((slide, i) => (
            /*
             * Each text slide occupies exactly 100vh.
             * Content is centered with flexbox.
             * Accent rule: a 3px left border in slide.accent color.
             */
            <div
              key={i}
              className="relative flex flex-col justify-center h-screen px-10 overflow-hidden"
              style={{ backgroundColor: leftBg }}
            >
              {/* Watermark: giant index number, absolutely positioned behind content */}
              <span
                className="ps-watermark absolute right-4 bottom-4 select-none pointer-events-none"
                style={{
                  fontSize: "clamp(6rem, 14vw, 11rem)",
                  fontWeight: 700,
                  lineHeight: 1,
                  // Only the active slide shows the accent-colored watermark
                  color: i === activeIndex ? slide.accent : "transparent",
                  opacity: i === activeIndex ? 0.08 : 0,
                }}
                aria-hidden="true"
              >
                {pad(i)}
              </span>

              {/* Accent left-border rule + text block */}
              <div
                className="ps-accent-rule pl-6 relative"
                style={{
                  borderLeft: `3px solid ${i === activeIndex ? slide.accent : "transparent"}`,
                }}
              >
                {/* Eyebrow / subtitle */}
                <p
                  className="mb-3 tracking-[0.2em] uppercase text-xs"
                  style={{ color: leftMutedColor }}
                >
                  {slide.subtitle}
                </p>

                {/* Title — large display text */}
                <h1
                  className="mb-4 font-bold leading-none"
                  style={{
                    fontSize: "clamp(2.2rem, 4vw, 3.5rem)",
                    color: leftTextColor,
                  }}
                >
                  {slide.title}
                </h1>

                {/* Body stat line */}
                <p
                  className="text-sm tracking-wide"
                  style={{ color: leftMutedColor }}
                >
                  {slide.body}
                </p>
              </div>

              {/* Counter — bottom-left of each text panel, only on active */}
              {showCounter && i === activeIndex && (
                <div
                  className="absolute bottom-10 left-10 text-xs tracking-[0.25em]"
                  style={{ color: leftMutedColor }}
                >
                  <span style={{ color: slide.accent }}>{pad(i)}</span>
                  <span className="mx-1">/</span>
                  <span>{pad(total - 1)}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Right panel — image stack ────────────────────────────────────── */}
        {/*
         * position:absolute, left = splitRatio%, width = remaining %.
         * All image divs stacked vertically (each 100vh tall).
         * translateY on click moves the strip up (negative) to reveal each image.
         * splitRatio is a runtime prop → inline style.
         */}
        <div
          ref={rightRef}
          className="ps-right-panel absolute top-0 h-full"
          style={{
            left: `${splitRatio}%`,
            width: `${100 - splitRatio}%`,
          }}
        >
          {slides.map((slide, i) => (
            /*
             * Each image div is 100vh tall, background covers the area.
             * A subtle dark vignette overlay improves readability at the split edge.
             */
            <div
              key={i}
              className="relative h-screen w-full bg-center bg-cover bg-no-repeat"
              style={{ backgroundImage: `url('${slide.image}')` }}
            >
              {/* Left-edge vignette so the split doesn't look harsh */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to right, rgba(0,0,0,0.35) 0%, transparent 18%)",
                }}
              />
            </div>
          ))}
        </div>

        {/* ── Nav buttons — straddling the split line ──────────────────────── */}
        {/*
         * Positioned at left = splitRatio%, top = 50%.
         * Down button: translateX(-100%) — sits on the left panel edge.
         * Up button: translateY(-100%) — sits on the right panel edge.
         * Both are pill-shaped; accent color is runtime → inline style.
         * splitRatio is runtime → inline style on the wrapper.
         */}
        <div
          className="absolute z-50"
          style={{
            left: `${splitRatio}%`,
            top: "50%",
          }}
        >
          {/* Down button — goes to previous slide (left panel scrolls down) */}
          <button
            className="ps-nav-btn absolute flex items-center justify-center cursor-pointer border-none"
            onClick={() => changeSlide("down")}
            aria-label="Previous slide"
            style={{
              transform: "translateX(-100%)",
              borderRadius: "50% 0 0 50%",
              width: 48,
              height: 48,
              backgroundColor: "rgba(255,255,255,0.07)",
              color: accent,
              // transition for accent color change between slides
              transition: `color ${transitionMs}ms ease-in-out, background-color 0.2s`,
              fontSize: 18,
            }}
          >
            {/* Simple SVG chevron — no external icon lib needed */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 6l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Up button — goes to next slide (right panel scrolls up) */}
          <button
            className="ps-nav-btn absolute flex items-center justify-center cursor-pointer border-none"
            onClick={() => changeSlide("up")}
            aria-label="Next slide"
            style={{
              transform: "translateY(-100%)",
              borderRadius: "0 50% 50% 0",
              width: 48,
              height: 48,
              backgroundColor: "rgba(255,255,255,0.07)",
              color: accent,
              transition: `color ${transitionMs}ms ease-in-out, background-color 0.2s`,
              fontSize: 18,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 10l4-4 4 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
